from rest_framework.views import APIView
from rest_framework.response import Response
from membros.permissions import IsStaffChurch
from django.db import connection, close_old_connections
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncMonth
from membros.models import Membro
from financeiro.models import Transacao
from datetime import datetime, timedelta
from django.utils import timezone

class ConsolidatedDashboardView(APIView):
    """
    Rota 'Mega-Endpoint' que consolida todas as informações necessárias 
    para o Dashboard Inicial e Estatísticas em uma única chamada.
    Isso reduz drasticamente o número de conexões ao banco de dados e 
    previne travamentos em instâncias Free do Render.
    """
    permission_classes = [IsStaffChurch]

    def get(self, request):
        try:
            # Garante conexão limpa
            close_old_connections()
            
            today = timezone.now()
            six_months_ago = today - timedelta(days=180)

            # 1. Dados Básicos (Dashboard Home)
            total_membros = Membro.objects.count()
            membros_ativos = Membro.objects.filter(status='LIGADO').count()
            
            # Finanças Totais
            financas_totais = Transacao.objects.aggregate(
                entradas=Sum('valor', filter=Q(tipo='ENTRADA')),
                saidas=Sum('valor', filter=Q(tipo='SAIDA'))
            )
            total_entradas = financas_totais['entradas'] or 0
            total_saidas = financas_totais['saidas'] or 0
            saldo_atual = total_entradas - total_saidas

            # 2. Estatísticas Detalhadas (Analytics)
            # Crescimento de Membros (Últimos 6 meses)
            crescimento = (
                Membro.objects.filter(data_entrada__gte=six_months_ago)
                .annotate(mes=TruncMonth('data_entrada'))
                .values('mes')
                .annotate(total=Count('id'))
                .order_by('mes')
            )

            # Histórico Financeiro (Últimos 6 meses)
            financeiro = (
                Transacao.objects.filter(data__gte=six_months_ago)
                .annotate(mes=TruncMonth('data'))
                .values('mes', 'tipo')
                .annotate(valor=Sum('valor'))
                .order_by('mes')
            )

            # Faixas Etárias
            faixas = {
                'Crianças (0-12)': Membro.objects.filter(data_nascimento__gte=today - timedelta(days=12*365)).count(),
                'Jovens (13-17)': Membro.objects.filter(data_nascimento__lt=today - timedelta(days=12*365), data_nascimento__gte=today - timedelta(days=17*365)).count(),
                'Adultos (18-59)': Membro.objects.filter(data_nascimento__lt=today - timedelta(days=17*365), data_nascimento__gte=today - timedelta(days=59*365)).count(),
                'Idosos (60+)': Membro.objects.filter(data_nascimento__lt=today - timedelta(days=59*365)).count(),
            }

            def format_mes(mes_date):
                if not mes_date: return "N/A"
                return mes_date.strftime('%b/%y')

            # Preparamos o retorno consolidado
            data = {
                "home": {
                    "total_membros": total_membros,
                    "membros_ativos": membros_ativos,
                    "total_entradas": total_entradas,
                    "total_saidas": total_saidas,
                    "saldo_atual": saldo_atual,
                },
                "analytics": {
                    "total_membros": total_membros,
                    "membros_ativos": membros_ativos,
                    "crescimento_membros": [
                        {'name': format_mes(c['mes']), 'total': c['total']} for c in crescimento
                    ],
                    "distribuicao_etaria": [{"faixa": k, "quantidade": v} for k, v in faixas.items()],
                    "historico_financeiro": [
                        {'name': format_mes(h['mes']), 'tipo': h['tipo'], 'valor': float(h['valor'])} for h in financeiro
                    ]
                },
                "status": "success",
                "timestamp": today.isoformat()
            }

            return Response(data)

        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=500)
        finally:
            # Crucial: Fecha a conexão explicitamente no final para liberar o Pooler do Supabase
            connection.close()
