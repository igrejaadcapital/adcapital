"""CRUD de funções eclesiásticas (tabela dinâmica)."""
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from membros.models import Funcao
from membros.permissions import IsAdminOrSecretario


@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def buscar_opcoes_funcao(request):
    try:
        return Response([{'id': f.id, 'nome': f.nome} for f in Funcao.objects.all().order_by('nome')])
    except Exception:
        return Response([{'id': 1, 'nome': 'Membro'}])


@api_view(['DELETE'])
@permission_classes([IsAdminOrSecretario])
def excluir_funcao(request, pk):
    try:
        Funcao.objects.get(pk=pk).delete()
        return Response({'success': True})
    except Exception as e:
        return Response({'error': str(e)}, status=400)


@api_view(['POST'])
@permission_classes([IsAdminOrSecretario])
def adicionar_funcao(request):
    try:
        nome = request.data.get('nome')
        if not nome or not str(nome).strip():
            return Response({'error': 'Nome é obrigatório'}, status=400)
        funcao, created = Funcao.objects.get_or_create(nome=str(nome).strip().upper())
        return Response({
            'id': funcao.id,
            'nome': funcao.nome,
            'created': created,
            'success': True,
        }, status=201)
    except Exception as e:
        print(f'ERRO AO ADICIONAR FUNCAO: {e}')
        return Response({'error': f'Erro no servidor: {e}'}, status=500)
