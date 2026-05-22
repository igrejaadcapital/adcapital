"""CRUD administrativo de membros e auto-cadastro via API."""
import json
import threading

from django.shortcuts import redirect
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from membros.models import ConfiguracaoPortal, Membro
from membros.permissions import IsAdminOrSecretario
from membros.serializers import MembroSerializer
from membros.services.cadastro_service import executar_tarefas_pos_cadastro
from membros.services.parentesco_service import salvar_parentescos
from membros.throttles import CadastroRateThrottle


class MembroPagination(PageNumberPagination):
    page_size = 1000


class MembroViewSet(viewsets.ModelViewSet):
    pagination_class = MembroPagination
    queryset = Membro.objects.all().select_related('funcao').prefetch_related(
        'parentescos__membro_destino'
    )
    serializer_class = MembroSerializer
    permission_classes = [IsAdminOrSecretario]

    @action(detail=False, methods=['get'])
    def lista(self, request):
        return self.list(request)

    @action(detail=True, methods=['get'])
    def detalhes(self, request, pk=None):
        return self.retrieve(request, pk)

    @action(detail=False, methods=['post'])
    def cadastrar(self, request):
        return self.create(request)

    @action(detail=True, methods=['put', 'patch'])
    def salvar(self, request, pk=None):
        return self.update(request, pk)

    def perform_create(self, serializer):
        self._salvar_com_parentescos(serializer)

    def perform_update(self, serializer):
        self._salvar_com_parentescos(serializer)

    def _salvar_com_parentescos(self, serializer):
        membro = serializer.save()
        try:
            if self.request.data.get('lgpd_documento'):
                membro.lgpd_consentido = True
                if not membro.lgpd_data_aceite:
                    membro.lgpd_data_aceite = timezone.now()
                membro.save()
        except Exception as e:
            print(f'Aviso: Erro ao salvar status LGPD no Admin: {e}')

        parentescos_data = self.request.data.get('parentescos_novo', [])
        if isinstance(parentescos_data, str):
            try:
                parentescos_data = json.loads(parentescos_data)
            except json.JSONDecodeError:
                parentescos_data = []
        salvar_parentescos(membro, parentescos_data)


class AutoCadastroMembroView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [CadastroRateThrottle]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        try:
            config = ConfiguracaoPortal.objects.filter(id=1).first()
            if config and not config.is_ativo:
                return Response({'error': 'Portal desativado'}, status=403)

            resposta_user = request.data.get('sync_resposta', '').strip().lower()
            resposta_correta = (config.resposta if config else 'Jesus').strip().lower()
            if resposta_user != resposta_correta:
                return Response({'error': 'Acesso negado: Resposta incorreta.'}, status=401)

            cpf_original = request.data.get('cpf')
            if not cpf_original:
                return Response({'error': 'CPF é obrigatório'}, status=400)

            cpf_limpo = ''.join(filter(str.isdigit, cpf_original))
            membro_existente = Membro.objects.filter(cpf=cpf_limpo).first()
            if membro_existente:
                serializer = MembroSerializer(membro_existente, data=request.data, partial=True)
            else:
                serializer = MembroSerializer(data=request.data)

            if not serializer.is_valid():
                return Response(serializer.errors, status=400)

            membro = serializer.save()
            parentescos_raw = request.data.get('parentescos_novo', [])
            if isinstance(parentescos_raw, str) and parentescos_raw:
                try:
                    parentescos_data = json.loads(parentescos_raw)
                except json.JSONDecodeError:
                    parentescos_data = []
            else:
                parentescos_data = parentescos_raw

            threading.Thread(
                target=executar_tarefas_pos_cadastro,
                args=(membro.id, parentescos_data),
                daemon=True,
            ).start()

            return Response({
                'success': True,
                'message': (
                    'Cadastro recebido! O processamento do seu termo LGPD está sendo '
                    'finalizado em segundo plano.'
                ),
                'id': membro.id,
                'is_update': membro_existente is not None,
            })
        except Exception as e:
            return Response({'error': 'Erro interno no servidor.', 'detail': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAdminOrSecretario])
def download_termo_lgpd(request, pk):
    try:
        membro = Membro.objects.get(pk=pk)
        if not membro.lgpd_documento:
            return Response({'error': 'Termo não encontrado para este membro.'}, status=404)
        return redirect(membro.lgpd_documento.url)
    except Membro.DoesNotExist:
        return Response({'error': 'Membro não encontrado.'}, status=404)
