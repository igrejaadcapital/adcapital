"""CRUD administrativo de membros e auto-cadastro via API."""
import logging

from django.shortcuts import redirect
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from membros.models import ConfiguracaoPortal, Membro
from membros.permissions import IsAdminOrSecretario
from membros.serializers import MembroSerializer
from membros.services.acesso_service import garantir_acesso_membro
from membros.services.cadastro_service import finalizar_cadastro_publico
from membros.contracts.parentesco import parse_parentescos_novo
from membros.services.parentesco_service import salvar_parentescos
from membros.services.lgpd_service import provisionar_termo_lgpd
from membros.throttles import CadastroRateThrottle

logger = logging.getLogger(__name__)


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
        garantir_acesso_membro(membro)

        uploading_signed = 'lgpd_documento' in self.request.FILES
        try:
            if uploading_signed:
                membro.lgpd_consentido = True
                if not membro.lgpd_data_aceite:
                    membro.lgpd_data_aceite = timezone.now()
                membro.save()
            elif not membro.lgpd_documento:
                provisionar_termo_lgpd(membro, enviar_email=bool(membro.email))
        except Exception as exc:
            logger.warning('Erro ao processar LGPD no Admin (membro_id=%s): %s', membro.id, exc)

        parentescos_data = parse_parentescos_novo(self.request.data.get('parentescos_novo', []))
        salvar_parentescos(membro, parentescos_data)


class AutoCadastroMembroView(APIView):
    """Auto-cadastro público (DRF) — substitui view_public.auto_cadastro_direto."""
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
                data_limpa = {
                    k: v for k, v in request.data.items()
                    if v not in (None, '', 'null', 'undefined')
                }
                serializer = MembroSerializer(membro_existente, data=data_limpa, partial=True)
            else:
                serializer = MembroSerializer(data=request.data)

            if not serializer.is_valid():
                return Response(serializer.errors, status=400)

            membro = serializer.save()
            parentescos_data = parse_parentescos_novo(request.data.get('parentescos_novo', []))
            lgpd_url = finalizar_cadastro_publico(membro, parentescos_data)

            return Response({
                'success': True,
                'message': 'Cadastro salvo!',
                'id': membro.id,
                'is_update': membro_existente is not None,
                'lgpd_url': lgpd_url,
            })
        except Exception:
            logger.exception('Erro no auto-cadastro público')
            return Response({'error': 'Erro interno no servidor.'}, status=500)


@api_view(['GET'])
@permission_classes([IsAdminOrSecretario])
def download_termo_lgpd_em_branco(request):
    from django.http import HttpResponse
    from membros.utils_termo_lgpd import gerar_termo_lgpd_pdf_em_branco

    nome_arquivo, pdf_file = gerar_termo_lgpd_pdf_em_branco()
    response = HttpResponse(pdf_file.read(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{nome_arquivo}"'
    return response


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
