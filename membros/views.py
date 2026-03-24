from rest_framework import viewsets
from .models import Membro
from .serializers import MembroSerializer

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