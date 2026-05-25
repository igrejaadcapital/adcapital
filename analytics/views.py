import os

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from membros.permissions import IsStaffChurch
from .models import Acesso
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from membros.models import Membro
from financeiro.models import Transacao
from datetime import datetime, timedelta
from django.utils import timezone

class DashboardStatsView(APIView):
    permission_classes = [IsStaffChurch]

    def get(self, request):
        today = timezone.now()
        six_months_ago = today - timedelta(days=180)

        # 1. Crescimento de Membros (Últimos 6 meses)
        crescimento = (
            Membro.objects.filter(data_entrada__gte=six_months_ago)
            .annotate(mes=TruncMonth('data_entrada'))
            .values('mes')
            .annotate(total=Count('id'))
            .order_by('mes')
        )

        # 2. Distribuição Etária
        # Calculando idades de forma simples no Python ou via queries
        # Para simplificar agora, vamos fazer faixas comuns
        faixas = {
            'Crianças (0-12)': Membro.objects.filter(data_nascimento__gte=today - timedelta(days=12*365)).count(),
            'Jovens (13-17)': Membro.objects.filter(data_nascimento__lt=today - timedelta(days=12*365), data_nascimento__gte=today - timedelta(days=17*365)).count(),
            'Adultos (18-59)': Membro.objects.filter(data_nascimento__lt=today - timedelta(days=17*365), data_nascimento__gte=today - timedelta(days=59*365)).count(),
            'Idosos (60+)': Membro.objects.filter(data_nascimento__lt=today - timedelta(days=59*365)).count(),
        }

        # 3. Saúde Financeira (Últimos 6 meses)
        financeiro = (
            Transacao.objects.filter(data__gte=six_months_ago)
            .annotate(mes=TruncMonth('data'))
            .values('mes', 'tipo')
            .annotate(valor=Sum('valor'))
            .order_by('mes')
        )

        def format_mes(mes_date):
            if not mes_date:
                return 'N/A'
            return mes_date.strftime('%b/%y')

        # 4. Tráfego Site vs Portal (tabela analytics.Acesso — não é Google Analytics)
        acessos_por_mes = (
            Acesso.objects.filter(timestamp__gte=six_months_ago)
            .annotate(mes=TruncMonth('timestamp'))
            .values('mes', 'pagina')
            .annotate(total=Count('id'))
            .order_by('mes')
        )
        historico_acessos_map = {}
        for row in acessos_por_mes:
            label = format_mes(row['mes'])
            if label not in historico_acessos_map:
                historico_acessos_map[label] = {'name': label, 'site': 0, 'portal': 0, 'sistema': 0}
            if row['pagina'] == 'SITE':
                historico_acessos_map[label]['site'] = row['total']
            elif row['pagina'] == 'PORTAL':
                historico_acessos_map[label]['portal'] = row['total']
            elif row['pagina'] == 'SISTEMA':
                historico_acessos_map[label]['sistema'] = row['total']

        stats = {
            'total_membros': Membro.objects.count(),
            'membros_ativos': Membro.objects.filter(status='LIGADO').count(),
            'total_acessos_site': Acesso.objects.filter(pagina='SITE').count(),
            'total_acessos_portal': Acesso.objects.filter(pagina='PORTAL').count(),
            'total_acessos_sistema': Acesso.objects.filter(pagina='SISTEMA').count(),
            'ga_measurement_id': os.environ.get('GA4_MEASUREMENT_ID', 'G-7KZ3C5J6TH'),
            'fonte_trafego': 'interno',
            'crescimento_membros': [
                {'name': format_mes(c['mes']), 'total': c['total']} for c in crescimento
            ],
            'distribuicao_etaria': [{'faixa': k, 'quantidade': v} for k, v in faixas.items()],
            'historico_financeiro': [
                {'name': format_mes(h['mes']), 'tipo': h['tipo'], 'valor': float(h['valor'])} for h in financeiro
            ],
            'historico_acessos': list(historico_acessos_map.values()),
        }

        return Response(stats)


class TrackAcessoView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        pagina = request.data.get('pagina')
        if pagina not in ('SITE', 'PORTAL', 'SISTEMA'):
            return Response({'error': 'pagina inválida'}, status=status.HTTP_400_BAD_REQUEST)
        Acesso.objects.create(pagina=pagina)
        return Response({'ok': True}, status=status.HTTP_201_CREATED)

