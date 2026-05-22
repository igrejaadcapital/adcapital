from rest_framework.views import APIView
from rest_framework.response import Response
from membros.permissions import IsStaffChurch
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

        # 4. Formatação para o Frontend
        def format_mes(mes_date):
            if not mes_date: return "N/A"
            return mes_date.strftime('%b/%y')

        stats = {
            'total_membros': Membro.objects.count(),
            'membros_ativos': Membro.objects.filter(status='LIGADO').count(),
            'crescimento_membros': [
                {'name': format_mes(c['mes']), 'total': c['total']} for c in crescimento
            ],
            'distribuicao_etaria': [{'faixa': k, 'quantidade': v} for k, v in faixas.items()],
            'historico_financeiro': [
                {'name': format_mes(h['mes']), 'tipo': h['tipo'], 'valor': float(h['valor'])} for h in financeiro
            ]
        }

        return Response(stats)
