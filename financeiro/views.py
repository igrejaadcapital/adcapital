from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import Transacao, CategoriaFinanceira
from .serializers import TransacaoSerializer, CategoriaFinanceiraSerializer

class TransacaoViewSet(viewsets.ModelViewSet):
    queryset = Transacao.objects.all().order_by('-data')
    serializer_class = TransacaoSerializer

class CategoriaFinanceiraViewSet(viewsets.ModelViewSet):
    queryset = CategoriaFinanceira.objects.all().order_by('nome')
    serializer_class = CategoriaFinanceiraSerializer

class DashboardAPIView(APIView):
    def get(self, request):
        # Cálculos de Entradas e Saídas Globais (Em Fase 2 evoluiremos para Mensal)
        entradas = Transacao.objects.filter(tipo='ENTRADA').aggregate(total=Sum('valor'))['total'] or 0
        saidas = Transacao.objects.filter(tipo='SAIDA').aggregate(total=Sum('valor'))['total'] or 0
        saldo = entradas - saidas

        return Response({
            'total_entradas': entradas,
            'total_saidas': saidas,
            'saldo_atual': saldo
        })
