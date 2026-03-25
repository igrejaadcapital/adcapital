from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Membro, Parentesco
from .serializers import MembroSerializer

@api_view(['GET'])
def buscar_opcoes_funcao(request):
    """Retorna a lista dinâmica de funções extraída do models"""
    opcoes = [{'id': f[0], 'nome': f[1]} for f in Membro.FUNCOES_CHOICES]
    return Response(opcoes)

@api_view(['GET'])
def buscar_opcoes_parentesco(request):
    """Retorna a lista dinâmica de graus de parentesco extraída do models"""
    opcoes = [{'id': f[0], 'nome': f[1]} for f in Parentesco.GRAU_CHOICES]
    return Response(opcoes)

class MembroViewSet(viewsets.ModelViewSet):
    """
    Esta classe cria automaticamente as rotas para:
    - Listar membros (GET)
    - Criar membro (POST)
    - Editar membro (PUT)
    - Excluir membro (DELETE)
    """
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