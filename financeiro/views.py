from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import Transacao, CategoriaFinanceira
from .serializers import TransacaoSerializer, CategoriaFinanceiraSerializer
from membros.models import Membro
from ofxparse import OfxParser
import io

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
        total_membros = Membro.objects.count()

        return Response({
            'total_entradas': entradas,
            'total_saidas': saidas,
            'saldo_atual': saldo,
            'total_membros': total_membros
        })

class ImportarOFXView(APIView):
    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "Nenhum arquivo enviado."}, status=400)
        
        try:
            # Recomeça a leitura do arquivo se necessário
            file_obj.seek(0)
            ofx = OfxParser.parse(io.BytesIO(file_obj.read()))
            transactions = []
            for account in ofx.accounts:
                for tx in account.statement.transactions:
                    transactions.append({
                        'id_ofx': tx.id,
                        'data': tx.date.strftime('%Y-%m-%d'),
                        'valor': abs(float(tx.amount)),
                        'descricao': tx.memo or tx.payee or "Sem descrição",
                        'tipo': 'ENTRADA' if tx.amount > 0 else 'SAIDA',
                    })
            return Response(transactions)
        except Exception as e:
            return Response({"error": f"Erro ao processar OFX: {str(e)}"}, status=500)
