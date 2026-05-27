# -*- coding: utf-8 -*-
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from financeiro.models import Transacao
from financeiro.services.relatorio_contabilidade import (
    build_contabilidade_workbook,
    workbook_to_bytes,
)


class Command(BaseCommand):
    help = 'Gera planilha Excel com entradas, saídas e resumo para envio à contabilidade.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            '-o',
            type=str,
            default='',
            help='Caminho do arquivo .xlsx (padrão: relatorios/contabilidade_YYYYMMDD_HHMMSS.xlsx)',
        )
        parser.add_argument('--data-inicio', type=str, default='', help='YYYY-MM-DD')
        parser.add_argument('--data-fim', type=str, default='', help='YYYY-MM-DD')
        parser.add_argument('--ano', type=int, default=None, help='Filtrar por ano (legado).')
        parser.add_argument('--mes', type=int, default=None, help='Filtrar por mês 1-12 (com --ano).')

    def handle(self, *args, **options):
        qs = Transacao.objects.all().order_by('data', 'id')

        data_inicio = options.get('data_inicio') or ''
        data_fim = options.get('data_fim') or ''
        if data_inicio:
            qs = qs.filter(data__gte=data_inicio)
        if data_fim:
            qs = qs.filter(data__lte=data_fim)

        ano = options.get('ano')
        mes = options.get('mes')
        if ano:
            qs = qs.filter(data__year=ano)
            if mes:
                qs = qs.filter(data__month=mes)

        if not qs.exists():
            self.stdout.write(self.style.WARNING('Nenhuma transação encontrada para os filtros informados.'))
            return

        periodo_label = ''
        if data_inicio or data_fim:
            periodo_label = f'{data_inicio or "…"} a {data_fim or "…"}'

        wb = build_contabilidade_workbook(qs, periodo_label=periodo_label)
        content = workbook_to_bytes(wb)

        output = options.get('output') or ''
        if not output:
            stamp = timezone.localtime().strftime('%Y%m%d_%H%M%S')
            rel_dir = Path(settings.BASE_DIR) / 'relatorios'
            rel_dir.mkdir(parents=True, exist_ok=True)
            output = rel_dir / f'contabilidade_{stamp}.xlsx'
        else:
            output = Path(output)
            output.parent.mkdir(parents=True, exist_ok=True)

        output.write_bytes(content)
        self.stdout.write(self.style.SUCCESS(f'Relatório gerado: {output.resolve()}'))
