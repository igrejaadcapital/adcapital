from datetime import datetime

from django.http import HttpResponse
from django.utils.dateparse import parse_date
from rest_framework.views import APIView

from .models import Transacao
from .permissions import FinanceiroPermission
from .services.relatorio_contabilidade import (
    build_contabilidade_workbook,
    workbook_to_bytes,
)


def _parse_bool(value, default=True):
    if value is None or value == '':
        return default
    return str(value).lower() in ('1', 'true', 'yes', 'sim', 'on')


class ExportarContabilidadeAPIView(APIView):
    """
    Exporta relatório Excel para contabilidade.

    Query params:
      - data_inicio, data_fim (YYYY-MM-DD)
      - tipo: TODOS | ENTRADA | SAIDA
      - incluir_lancamentos, incluir_abas_separadas, incluir_resumo (true/false)
    """
    permission_classes = [FinanceiroPermission]

    def get(self, request):
        data_inicio = parse_date(request.query_params.get('data_inicio', ''))
        data_fim = parse_date(request.query_params.get('data_fim', ''))
        tipo = (request.query_params.get('tipo') or 'TODOS').upper()

        if request.query_params.get('data_inicio') and not data_inicio:
            return HttpResponse('data_inicio inválida. Use YYYY-MM-DD.', status=400)
        if request.query_params.get('data_fim') and not data_fim:
            return HttpResponse('data_fim inválida. Use YYYY-MM-DD.', status=400)
        if data_inicio and data_fim and data_inicio > data_fim:
            return HttpResponse('data_inicio não pode ser posterior a data_fim.', status=400)
        if tipo not in ('TODOS', 'ENTRADA', 'SAIDA'):
            return HttpResponse('tipo deve ser TODOS, ENTRADA ou SAIDA.', status=400)

        incluir_lancamentos = _parse_bool(request.query_params.get('incluir_lancamentos'), True)
        incluir_abas_separadas = _parse_bool(request.query_params.get('incluir_abas_separadas'), True)
        incluir_resumo = _parse_bool(request.query_params.get('incluir_resumo'), True)

        if not any((incluir_lancamentos, incluir_abas_separadas, incluir_resumo)):
            return HttpResponse('Selecione ao menos um conteúdo para exportar.', status=400)

        qs = Transacao.objects.all().order_by('data', 'id')
        if data_inicio:
            qs = qs.filter(data__gte=data_inicio)
        if data_fim:
            qs = qs.filter(data__lte=data_fim)
        if tipo != 'TODOS':
            qs = qs.filter(tipo=tipo)

        periodo_label = ''
        if data_inicio or data_fim:
            fmt = '%d/%m/%Y'
            ini = data_inicio.strftime(fmt) if data_inicio else '…'
            fim = data_fim.strftime(fmt) if data_fim else '…'
            periodo_label = f'{ini} a {fim}'

        wb = build_contabilidade_workbook(
            qs,
            incluir_lancamentos=incluir_lancamentos,
            incluir_abas_separadas=incluir_abas_separadas and tipo == 'TODOS',
            incluir_resumo=incluir_resumo,
            periodo_label=periodo_label,
        )
        content = workbook_to_bytes(wb)

        stamp = datetime.now().strftime('%Y%m%d')
        suffix = ''
        if data_inicio:
            suffix += f'_{data_inicio.isoformat()}'
        if data_fim:
            suffix += f'_ate_{data_fim.isoformat()}'
        filename = f'contabilidade_adcapital{suffix or f"_{stamp}"}.xlsx'

        response = HttpResponse(
            content,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
