from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Membro, Parentesco
from .serializers import MembroSerializer

from django.http import JsonResponse

@api_view(['GET'])
def buscar_opcoes_funcao(request):
    # Pega as tuplas ('MEMBRO', 'Membro') do Model
    opcoes = [{'id': f[0], 'nome': f[1]} for f in Membro.FUNCOES_CHOICES]
    return Response(opcoes)

def buscar_opcoes_parentesco(request):
    # Pega as opções definidas no campo 'grau' do seu model
    opcoes = [
        {'id': valor, 'nome': rotulo} 
        for valor, rotulo in Parentesco.GRAU_CHOICES 
    ]
    return JsonResponse(opcoes, safe=False)

def opcoes_funcao(request):
    # Retorna as opções de FUNÇÃO definidas no seu Model
    opcoes = [
        {'id': 'MEMBRO', 'nome': 'Membro(a)'},
        {'id': 'PASTOR', 'nome': 'Pastor(a)'},
        {'id': 'PRESBITERO', 'nome': 'Presbítero(a)'},
        {'id': 'DIACONO', 'nome': 'Diácono/Diaconisa'},
        {'id': 'EVANGELISTA', 'nome': 'Evangelista(a)'},
        {'id': 'MISSIONARIO', 'nome': 'Missionário(a)'},
        {'id': 'COOPERADOR', 'nome': 'Cooperador(a)'},
    ]
    return JsonResponse(opcoes, safe=False)

def opcoes_parentesco(request):
    # Retorna as opções de PARENTESCO (PAI_MAE, CONJUGE, etc)
    # Use as mesmas chaves que definimos no OPPOSTOS do signals.py
    opcoes = [
        {'id': 'PAI_MAE', 'nome': 'Pai/Mãe'},
        {'id': 'FILHO_A', 'nome': 'Filho(a)'},
        {'id': 'CONJUGE', 'nome': 'Cônjuge'},
        {'id': 'IRMAO_A', 'nome': 'Irmão(ã)'},
    ]
    return JsonResponse(opcoes, safe=False)

class MembroViewSet(viewsets.ModelViewSet):
    queryset = Membro.objects.all()
    serializer_class = MembroSerializer

    def perform_create(self, serializer):
        self._salvar_com_parentescos(serializer)

    def perform_update(self, serializer):
        self._salvar_com_parentescos(serializer)

    def _salvar_com_parentescos(self, serializer):
        membro = serializer.save()
        parentescos_data = self.request.data.get('parentescos_novo', [])
        
        if self.action == 'update' or self.action == 'partial_update':
            # Remove apenas os vínculos que este membro criou originalmente
            # Isso evita erros de "Unique Constraint" ao tentar recriar o que já existe
            Parentesco.objects.filter(membro_origem=membro).delete()

        for item in parentescos_data:
            # Frontend pode enviar "parente_id" ou "membro_destino"
            p_id = item.get('parente_id') or item.get('membro_destino')
            grau = item.get('grau')

            # Só tenta criar se o ID do parente for diferente do ID do próprio membro
            if p_id and grau and str(p_id) != str(membro.id):
                # Usamos get_or_create para não dar erro se o inverso já existir
                Parentesco.objects.get_or_create(
                    membro_origem=membro,
                    membro_destino_id=p_id,
                    defaults={'grau': grau}
                )

