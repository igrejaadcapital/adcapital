"""Portal do membro: perfil, comentários e devocionais."""
from rest_framework import viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from membros.models import ComentarioPalavra, Devocional
from membros.permissions import IsAdmin, IsStaffChurch
from membros.serializers import ComentarioPalavraSerializer, DevocionalSerializer, MembroSerializer
from membros.contracts.parentesco import parse_parentescos_novo
from membros.services.parentesco_service import salvar_parentescos


class MeusDadosView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        perfil = getattr(request.user, 'perfil', None)
        if not perfil or not perfil.membro:
            return Response(
                {'error': f'Perfil de membro não encontrado para: {request.user.username}'},
                status=404,
            )
        return Response(MembroSerializer(perfil.membro).data)

    def patch(self, request):
        perfil = getattr(request.user, 'perfil', None)
        if not perfil or not perfil.membro:
            return Response(
                {'error': f'Perfil de membro não encontrado para: {request.user.username}'},
                status=404,
            )
        campos_permitidos = [
            'telefone', 'email', 'logradouro', 'numero', 'complemento', 'bairro',
            'cidade', 'uf', 'cep', 'data_nascimento', 'genero', 'estado_civil',
            'naturalidade', 'data_entrada', 'unidade', 'departamento',
            'motivo_entrada', 'observacoes', 'funcao', 'foto',
        ]
        data = {k: v for k, v in request.data.items() if k in campos_permitidos}
        serializer = MembroSerializer(perfil.membro, data=data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        serializer.save()

        parentescos_data = parse_parentescos_novo(request.data.get('parentescos_novo', []))
        if parentescos_data:
            salvar_parentescos(perfil.membro, parentescos_data)
        return Response(serializer.data)


class ComentarioPalavraViewSet(viewsets.ModelViewSet):
    queryset = ComentarioPalavra.objects.all()
    serializer_class = ComentarioPalavraSerializer

    def get_permissions(self):
        if self.action in ['list', 'create', 'retrieve']:
            return [AllowAny()]
        return [IsAdmin()]


class DevocionalViewSet(viewsets.ModelViewSet):
    queryset = Devocional.objects.all()
    serializer_class = DevocionalSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action == 'destroy':
            return [IsAdmin()]
        return [IsStaffChurch()]
