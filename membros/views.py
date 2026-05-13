# -*- coding: utf-8 -*-

import threading
import json
import traceback
import urllib.request
import xml.etree.ElementTree as ET
import time
import os

from django.core.mail import EmailMessage

from django.conf import settings

from django.core.files.base import ContentFile

from django.core.cache import cache

from rest_framework.decorators import api_view, permission_classes, authentication_classes, action

from rest_framework.response import Response

from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination

from rest_framework.views import APIView

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .utils import gerar_termo_lgpd_pdf, enviar_email_resend_api

from django.contrib.auth.models import User
from .models import Membro, Parentesco, Funcao, ConfiguracaoPortal, ConfiguracaoSite, FotoGaleria, Perfil, ComentarioPalavra, Devocional

from .serializers import MembroSerializer, ConfiguracaoPortalSerializer, ConfiguracaoSiteSerializer, FotoGaleriaSerializer, ComentarioPalavraSerializer, DevocionalSerializer

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod

    def get_token(cls, user):

        token = super().get_token(user)

        token['username'] = user.username

        token['role'] = user.perfil.role if hasattr(user, 'perfil') else 'MEMBRO'

        token['nome'] = user.get_full_name() or user.username

        return token

    def validate(self, attrs):
        # Limpa o username se for um CPF formatado (ex: 115.125...)
        username = attrs.get("username", "")
        if username and any(char in username for char in '.-'):
            attrs["username"] = "".join(filter(str.isdigit, username))

        data = super().validate(attrs)

        data['role'] = self.user.perfil.role if hasattr(self.user, 'perfil') else 'MEMBRO'

        data['nome'] = self.user.get_full_name() or self.user.username

        return data

class CustomTokenObtainPairView(TokenObtainPairView):

    serializer_class = CustomTokenObtainPairSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def ping_view(request):
    """Endpoint ultraleve (Zero-DB) para acordar o servidor e monitorar latência básica."""
    _garantir_keep_alive()  # Garante que o self-keep-alive está rodando
    return Response({'status': 'ok', 'message': 'Servidor acordado!'}, status=200)

@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def health_check(request):
    """Monitor de integridade: Checa o banco de dados com timeout curto (2s)."""
    from django.db import connection, close_old_connections
    try:
        close_old_connections()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return Response({'status': 'healthy', 'database': 'ok'}, status=200)
    except Exception as e:
        return Response({'status': 'unhealthy', 'error': str(e)}, status=503)

# ========================================================================
# SELF-KEEP-ALIVE: Impede o Render Free de desligar o servidor
# ========================================================================
_keep_alive_started = False
_keep_alive_lock = threading.Lock()

def _self_keep_alive_loop():
    """Thread daemon que faz self-ping a cada 4 minutos para manter o Render acordado."""
    # Prioriza o hostname do Render se disponível para evitar pings externos desnecessários
    render_host = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
    if render_host:
        api_url = f"https://{render_host}"
    else:
        api_url = os.environ.get('RENDER_EXTERNAL_URL', 'https://api.adcapitaligreja.com.br')
    
    ping_url = f"{api_url.rstrip('/')}/api/ping/"
    print(f"[Keep-Alive] Monitor iniciado para: {ping_url}")
    
    while True:
        time.sleep(240)  # 4 minutos
        try:
            # Adiciona headers básicos para parecer uma requisição legítima e evitar bloqueios
            headers = {
                'User-Agent': 'SelfKeepAlive/1.1',
                'Accept': 'application/json'
            }
            req = urllib.request.Request(ping_url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as response:
                if response.status == 200:
                    print(f"[Keep-Alive] Self-ping OK em {ping_url}")
                else:
                    print(f"[Keep-Alive] Self-ping retornou status {response.status} em {ping_url}")
        except Exception as e:
            print(f"[Keep-Alive] Falha no self-ping para {ping_url}: {e}")

def _garantir_keep_alive():
    """Inicia o loop de keep-alive apenas uma vez (thread-safe)."""
    global _keep_alive_started
    if _keep_alive_started:
        return
    with _keep_alive_lock:
        if _keep_alive_started:
            return
        _keep_alive_started = True
        t = threading.Thread(target=_self_keep_alive_loop, daemon=True)
        t.start()
        print("[Keep-Alive] Thread de self-ping iniciada (intervalo: 4 min)")

# ========================================================================
# ENDPOINTS CONSOLIDADOS: Reduz múltiplos requests para 1
# ========================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def init_publico(request):
    """
    Endpoint consolidado para a página de Auto-Cadastro.
    Retorna config do portal + opções de parentesco + opções de função em 1 chamada.
    """
    _garantir_keep_alive()
    from django.db import close_old_connections
    try:
        close_old_connections()
        config = ConfiguracaoPortal.objects.filter(id=1).first()
        graus = [{'id': f[0], 'nome': f[1]} for f in Parentesco.GRAU_CHOICES]
        funcoes_db = Funcao.objects.all().order_by('nome')
        funcoes_list = [{'id': f.id, 'nome': f.nome} for f in funcoes_db]

        return Response({
            'portal': {
                'is_ativo': config.is_ativo if config else True,
                'pergunta': config.pergunta if config else 'Qual o seu melhor amigo?',
            },
            'graus': graus,
            'funcoes': funcoes_list,
        })
    except Exception as e:
        print(f"Erro em init_publico: {e}")
        return Response({
            'portal': {'is_ativo': True, 'pergunta': 'Qual o seu melhor amigo? (Modo Seguro)'},
            'graus': [{'id': f[0], 'nome': f[1]} for f in Parentesco.GRAU_CHOICES],
            'funcoes': [{'id': 1, 'nome': 'Membro'}],
        })

@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def init_site(request):
    """
    Endpoint consolidado para o Site Institucional (Landing Page).
    Retorna config do site + programação semanal + galeria em 1 chamada.
    """
    _garantir_keep_alive()
    from django.db import close_old_connections
    from agenda.models import ProgramacaoSemanal
    from agenda.serializers import ProgramacaoSemanalSerializer
    try:
        close_old_connections()
        config = ConfiguracaoSite.objects.filter(id=1).first()
        if not config:
            config, _ = ConfiguracaoSite.objects.get_or_create(id=1)
        config_data = ConfiguracaoSiteSerializer(config).data

        programacao = ProgramacaoSemanal.objects.all().order_by('dia_semana', 'ordem')
        programacao_data = ProgramacaoSemanalSerializer(programacao, many=True).data

        galeria = FotoGaleria.objects.all().order_by('ordem', '-criado_em')
        galeria_data = FotoGaleriaSerializer(galeria, many=True).data

        return Response({
            'config': config_data,
            'programacao': programacao_data,
            'galeria': galeria_data,
        })
    except Exception as e:
        print(f"Erro em init_site: {e}")
        return Response({
            'config': {},
            'programacao': [],
            'galeria': [],
        })

@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def curtir_palavra(request):
    """Incrementa a contagem de curtidas na palavra pastoral."""
    _garantir_keep_alive()
    from django.db import close_old_connections
    try:
        close_old_connections()
        config, _ = ConfiguracaoSite.objects.get_or_create(id=1)
        config.curtidas_palavra += 1
        config.save()
        return Response({'success': True, 'curtidas_palavra': config.curtidas_palavra})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])

@permission_classes([AllowAny])

@authentication_classes([])

def ultimo_video_youtube(request):

    """Retorna o último vídeo do canal YouTube via RSS (sem API key). Cache de 1 hora."""

    cache_key = 'yt_ultimo_video'

    cached = cache.get(cache_key)

    if cached:

        return Response(cached)

    try:

        config = ConfiguracaoSite.objects.filter(id=1).first()

        channel_id = config.youtube_channel_id if config else None

        if not channel_id:

            return Response({'error': 'Canal YouTube não configurado.'}, status=404)

        rss_url = f'https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}'

        req = urllib.request.Request(rss_url, headers={'User-Agent': 'Mozilla/5.0'})

        with urllib.request.urlopen(req, timeout=10) as resp:

            xml_data = resp.read()

        ns = {

            'atom': 'http://www.w3.org/2005/Atom',

            'media': 'http://search.yahoo.com/mrss/',

            'yt': 'http://www.youtube.com/xml/schemas/2015'

        }

        root = ET.fromstring(xml_data)

        entry = root.find('atom:entry', ns)

        if entry is None:

            return Response({'error': 'Nenhum vídeo encontrado.'}, status=404)

        video_id = entry.find('yt:videoId', ns).text

        title = entry.find('atom:title', ns).text

        published = entry.find('atom:published', ns).text

        thumbnail = f'https://i.ytimg.com/vi/{video_id}/hqdefault.jpg'

        data = {

            'video_id': video_id,

            'title': title,

            'published': published,

            'thumbnail': thumbnail,

            'embed_url': f'https://www.youtube.com/embed/{video_id}',

            'live_embed_url': f'https://www.youtube.com/embed/live?channel={channel_id}',

            'watch_url': f'https://www.youtube.com/watch?v={video_id}',

        }

        cache.set(cache_key, data, 3600)  # Cache por 1 hora

        return Response(data)

    except Exception as e:

        return Response({'error': str(e)}, status=500)

@api_view(['GET'])

@permission_classes([AllowAny])

@authentication_classes([])

def buscar_opcoes_funcao(request):

    """Retorna a lista dinâmica de funções da tabela Funcao"""

    try:

        funcoes = Funcao.objects.all().order_by('nome')

        opcoes = [{'id': f.id, 'nome': f.nome} for f in funcoes]

        return Response(opcoes)

    except Exception:

        return Response([{'id': 1, 'nome': 'Membro'}])

@api_view(['DELETE'])

@permission_classes([IsAuthenticated])

def excluir_funcao(request, pk):

    """Exclui uma função pelo ID (Apenas Admin)"""

    try:

        funcao = Funcao.objects.get(pk=pk)

        funcao.delete()

        return Response({'success': True})

    except Exception as e:

        return Response({'error': str(e)}, status=400)

@api_view(['POST'])

@permission_classes([IsAuthenticated])

def adicionar_funcao(request):

    """Cria uma nova função manualmente (Apenas Admin)"""

    try:

        nome = request.data.get('nome')

        if not nome or not str(nome).strip():

            return Response({'error': 'Nome é obrigatório'}, status=400)

        # Limpa o nome para evitar espaços extras e padroniza

        nome_limpo = str(nome).strip().upper()

        funcao, created = Funcao.objects.get_or_create(nome=nome_limpo)

        return Response({

            'id': funcao.id, 

            'nome': funcao.nome, 

            'created': created,

            'success': True

        }, status=201)

    except Exception as e:

        # Se der erro 500, agora retornamos o motivo real em vez de uma página HTML genérica

        print(f"ERRO AO ADICIONAR FUNCAO: {str(e)}")

        return Response({

            'error': f"Erro no servidor: {str(e)}",

            'detail': "Verifique se a tabela de funções existe no banco de dados."

        }, status=500)

@api_view(['GET'])

@permission_classes([AllowAny])

@authentication_classes([])

def buscar_opcoes_parentesco(request):

    """Retorna a lista dinâmica de graus de parentesco extraída do models"""

    opcoes = [{'id': f[0], 'nome': f[1]} for f in Parentesco.GRAU_CHOICES]

    return Response(opcoes)

@api_view(['GET'])

@permission_classes([AllowAny])

@authentication_classes([])

def buscar_configuracao_publica(request):
    """Retorna apenas o status e a pergunta do portal para o público. Cache leve de 5 min."""
    from django.db import connection, close_old_connections
    try:
        # Garante que não estamos usando uma conexão zumbi
        close_old_connections()
        config = ConfiguracaoPortal.objects.filter(id=1).first()
        
        if not config:
            return Response({
                "is_ativo": True,
                "pergunta": "Qual o seu melhor amigo?"
            })

        return Response({
            "is_ativo": config.is_ativo,
            "pergunta": config.pergunta
        })
    except Exception as e:
        print(f"Erro ao buscar config pública: {e}")
        # Fallback de segurança se o banco estiver inacessível
        return Response({
            "is_ativo": True,
            "pergunta": "Qual o seu melhor amigo? (Modo de Segurança)"
        })

@api_view(['POST'])

@permission_classes([AllowAny])

@authentication_classes([])

def verificar_resposta_portal(request):

    """Verifica se a resposta do membro está correta para liberar o formulário"""

    resposta_user = request.data.get('resposta', '').strip().lower()

    config = ConfiguracaoPortal.objects.filter(id=1).first()

    # Se por algum motivo a resposta no banco estiver vazia ou objeto inexistente, usamos o padrão "Jesus"

    resposta_correta = (config.resposta if config else "Jesus").strip().lower()

    is_ativo = config.is_ativo if config else True

    if not is_ativo:

        return Response({"error": "O portal de cadastro está desativado no momento."}, status=403)

    if resposta_user == resposta_correta:

        return Response({"success": True})

    return Response({"success": False, "error": "Resposta incorreta. Dica: Tente 'Jesus'."}, status=401)

class ConfiguracaoPortalViewSet(viewsets.ModelViewSet):

    """Gerenciamento da configuração pelo Admin (id fixo = 1)"""

    queryset = ConfiguracaoPortal.objects.all()

    serializer_class = ConfiguracaoPortalSerializer

    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):

        config = ConfiguracaoPortal.objects.filter(id=1).first()

        if not config:

            config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)

        serializer = self.get_serializer(config)

        return Response(serializer.data)

    def update(self, request, *args, **kwargs):

        config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)

        serializer = self.get_serializer(config, data=request.data, partial=True)

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(serializer.data)

class ConfiguracaoSiteViewSet(viewsets.ModelViewSet):

    """Gestão da configuração do site institucional (id fixo = 1)"""

    queryset = ConfiguracaoSite.objects.all()

    serializer_class = ConfiguracaoSiteSerializer

    def get_permissions(self):

        if self.action in ['list', 'retrieve']:

            return [AllowAny()]

        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):

        config = ConfiguracaoSite.objects.filter(id=1).first()

        if not config:

             config, _ = ConfiguracaoSite.objects.get_or_create(id=1)

        serializer = self.get_serializer(config)

        return Response(serializer.data)

    def update(self, request, *args, **kwargs):

        config, _ = ConfiguracaoSite.objects.get_or_create(id=1)

        serializer = self.get_serializer(config, data=request.data, partial=True)

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(serializer.data)

class FotoGaleriaViewSet(viewsets.ModelViewSet):

    """Gestão da galeria de fotos do site"""

    queryset = FotoGaleria.objects.all().order_by('ordem', '-criado_em')

    serializer_class = FotoGaleriaSerializer

    def get_permissions(self):

        if self.action in ['list', 'retrieve']:

            return [AllowAny()]

        return [IsAuthenticated()]

class MembroPagination(PageNumberPagination):
    page_size = 50

def _salvar_parentescos_direto(membro, parentescos_data):
    """Lógica unificada para salvar parentescos. Apaga os antigos e cria os novos."""
    Parentesco.objects.filter(membro_origem=membro).delete()
    if not parentescos_data:
        return
    for item in parentescos_data:
        p_id = item.get('parente_id') or item.get('membro_destino')
        grau = item.get('grau')
        if p_id and grau and str(p_id) != str(membro.id):
            Parentesco.objects.get_or_create(
                membro_origem=membro,
                membro_destino_id=p_id,
                defaults={'grau': grau}
            )

class MembroViewSet(viewsets.ModelViewSet):
    """CRUD administrativo completo para Membros"""
    pagination_class = MembroPagination

    queryset = Membro.objects.all().select_related('funcao').prefetch_related('parentescos__membro_destino')

    serializer_class = MembroSerializer

    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def lista(self, request):
        """Retorna a lista de membros (URL: /api/membros/lista/)"""
        return self.list(request)

    @action(detail=True, methods=['get'])
    def detalhes(self, request, pk=None):
        """Retorna detalhes de um membro (URL: /api/membros/{id}/detalhes/)"""
        return self.retrieve(request, pk)

    @action(detail=False, methods=['post'])
    def cadastrar(self, request):
        """Cria um novo membro (URL: /api/membros/cadastrar/)"""
        return self.create(request)

    @action(detail=True, methods=['put', 'patch'])
    def salvar(self, request, pk=None):
        """Atualiza um membro existente (URL: /api/membros/{id}/salvar/)"""
        return self.update(request, pk)

    def perform_create(self, serializer):

        self._salvar_com_parentescos(serializer)

    def perform_update(self, serializer):

        self._salvar_com_parentescos(serializer)

    def _salvar_com_parentescos(self, serializer):

        membro = serializer.save()

        # Se um documento LGPD foi enviado pelo admin, atualiza o status de consentimento

        try:

            if 'lgpd_documento' in self.request.data and self.request.data['lgpd_documento']:

                 membro.lgpd_consentido = True

                 if not membro.lgpd_data_aceite:

                      from django.utils import timezone

                      membro.lgpd_data_aceite = timezone.now()

                 membro.save()

        except Exception as e:

            print(f"Aviso: Erro ao salvar status LGPD no Admin: {e}")

        parentescos_data = self.request.data.get('parentescos_novo', [])
        if isinstance(parentescos_data, str):
            try:
                parentescos_data = json.loads(parentescos_data)
            except:
                parentescos_data = []

        _salvar_parentescos_direto(membro, parentescos_data)

def _executar_tarefas_pos_cadastro(membro_id, parentescos_data):
    """
    Executa tarefas pesadas em background sem prender a conexão com o banco.
    """
    from django.db import connection, close_old_connections
    try:
        # 1. Garante conexão limpa e busca dados básicos
        close_old_connections()
        from .models import Membro, Parentesco
        membro = Membro.objects.get(id=membro_id)
        
        # Carrega dados necessários e FECHA a conexão antes da rede/cpu
        membro_nome = membro.nome
        membro_email = membro.email
        membro_cpf = membro.cpf
        connection.close() 

        print(f"--- [BG-THREAD] Iniciando processamento para {membro_nome} ---")

        # 2. Geração de PDF (CPU Heavy)
        from .utils import gerar_termo_lgpd_pdf, enviar_email_resend_api
        nome_arquivo, pdf_file = gerar_termo_lgpd_pdf(membro)
        pdf_bytes = pdf_file.read()
        print(f"--- [BG-THREAD] PDF Gerado ({len(pdf_bytes)} bytes)")

        # 3. Envio de E-mail (Network Heavy - Timeout 15s)
        if membro_email:
            print(f"--- [BG-THREAD] Usando Resend API para {membro_email}...")
            enviar_email_resend_api(
                to=membro_email,
                subject='Bem-vindo! Seu Termo de Ciência e Aceite (LGPD)',
                body=f'Olá {membro_nome},\n\ní‰ com alegria que confirmamos o seu cadastro no portal da Igreja Assembleia de Deus Ministério na Capital.\n\nPara finalizarmos o processo administrativo, enviamos em anexo o Termo de Consentimento de Dados Pessoais (LGPD). Pedimos a gentileza de assinar o documento anexo e nos enviar uma cópia (digitalizada ou foto legível). Você pode responder diretamente a esta mensagem ou enviá-la para igrejaadcapital@gmail.com.\n\nFraternalmente,\nEquipe AD Capital',
                filename=nome_arquivo,
                file_content=pdf_bytes
            )

        # 4. Volta ao Banco (Cloudinary e Parentesco)
        # O Django abrirá uma nova conexão automaticamente aqui
        close_old_connections()
        membro = Membro.objects.get(id=membro_id)
        from django.core.files.base import ContentFile
        membro.lgpd_documento.save(nome_arquivo, ContentFile(pdf_bytes), save=True)

        if parentescos_data:
            print("--- [BG-THREAD] Processando parentescos...")
            for item in parentescos_data:
                p_id = item.get('parente_id') or item.get('membro_destino')
                grau = item.get('grau')
                if p_id and grau and str(p_id) != str(membro.id):
                    if Membro.objects.filter(id=p_id).exists():
                        Parentesco.objects.get_or_create(
                            membro_origem=membro,
                            membro_destino_id=p_id,
                            defaults={'grau': grau}
                        )
            print("--- [BG-THREAD] Parentescos processados.")

    except Exception:
        print("--- [BG-THREAD] ERRO CRí TICO EM TAREFAS DE BACKGROUND ---")
        import traceback
        traceback.print_exc()

    finally:
        try:
            connection.close()
            print("--- [BG-THREAD] Conexão finalizada.")
        except:
            pass

class AutoCadastroMembroView(APIView):

    """

    Endpoint para auto-cadastro de membros.

    Permite criar ou editar (se CPF já existir e resposta estiver correta).

    """

    permission_classes = [AllowAny]

    authentication_classes = [] # Desativa autenticação para o portal público

    parser_classes = [MultiPartParser, FormParser, JSONParser] # Suporte a diversos formatos de dados

    def post(self, request):

        print("--- [DEBUG] Iniciando AutoCadastroMembroView.post ---")

        try:

            config = ConfiguracaoPortal.objects.filter(id=1).first()

            is_ativo = config.is_ativo if config else True

            if not is_ativo:

                return Response({"error": "Portal desativado"}, status=403)

            resposta_user = request.data.get('sync_resposta', '').strip().lower()

            resposta_correta = (config.resposta if config else "Jesus").strip().lower()

            if resposta_user != resposta_correta:

                 return Response({"error": "Acesso negado: Resposta incorreta."}, status=401)

            cpf_original = request.data.get('cpf')

            if not cpf_original:

                return Response({"error": "CPF é obrigatório"}, status=400)

            cpf_limpo = "".join(filter(str.isdigit, cpf_original))

            membro_existente = Membro.objects.filter(cpf=cpf_limpo).first()

            if membro_existente:

                serializer = MembroSerializer(membro_existente, data=request.data, partial=True)

            else:

                serializer = MembroSerializer(data=request.data)

            if serializer.is_valid():

                # SALVAMENTO IMEDIATO DO DISCO/INFOS BíSICAS

                membro = serializer.save()

                # Dados de parentesco

                parentescos_raw = request.data.get('parentescos_novo', [])

                if isinstance(parentescos_raw, str) and parentescos_raw:

                    try:

                        parentescos_data = json.loads(parentescos_raw)

                    except:

                        parentescos_data = []

                else:

                    parentescos_data = parentescos_raw

                # DISPARA TAREFAS PESADAS EM THREAD SEPARADA

                print(f"--- [DEBUG] Disparando tarefas de background para membro {membro.id} ---")

                thread = threading.Thread(

                    target=_executar_tarefas_pos_cadastro,

                    args=(membro.id, parentescos_data)

                )

                thread.start()

                return Response({

                    "success": True, 

                    "message": "Cadastro recebido! O processamento do seu termo LGPD está sendo finalizado em segundo plano.",

                    "id": membro.id,

                    "is_update": membro_existente is not None

                })

            return Response(serializer.errors, status=400)

        except Exception as e:

            print(f"--- [DEBUG] !!! ERRO CRíTICO !!!: {str(e)}")

            return Response({

                "error": "Erro interno no servidor.",

                "detail": str(e)

            }, status=500)

@api_view(['GET'])

@permission_classes([AllowAny])

@authentication_classes([])

def run_migrations_debug(request):

    """View temporária para forçar migrações e ver o log no navegador"""

    from django.core.management import call_command

    from io import StringIO

    out = StringIO()

    print("--- [DEBUG] Rodando migrações manualmente via endpoint ---")

    try:

        call_command('migrate', stdout=out, stderr=out)

        result = out.getvalue()

        return Response({"success": True, "output": result})

    except Exception as e:

        import traceback

        return Response({

            "success": False, 

            "error": str(e), 

            "traceback": traceback.format_exc(),

            "output": out.getvalue()

        }, status=500)

@api_view(['GET'])

@permission_classes([AllowAny])

def download_termo_lgpd(request, pk):

    """Endpoint para baixar o termo de LGPD via API usando o Cloudinary"""

    try:

        from django.shortcuts import redirect

        membro = Membro.objects.get(pk=pk)

        if not membro.lgpd_documento:

             return Response({"error": "Termo não encontrado para este membro."}, status=404)

        # Como estamos usando Cloudinary, retornamos a URL direta para download

        return redirect(membro.lgpd_documento.url)

    except Membro.DoesNotExist:

        return Response({"error": "Membro não encontrado."}, status=404)

@api_view(['GET'])

@permission_classes([AllowAny])

@authentication_classes([])

def buscar_membros_autocomplete_publico(request):

    """

    Busca de membros para ví­nculo familiar no cadastro píºblico.

    Exige no mí­nimo 3 caracteres para ní£o vazar a lista completa de membros.

    Retorna apenas ID e Nome (limite de 10).

    """

    query = request.GET.get('q', '').strip()

    if len(query) < 3:

        return Response([])

    membros = Membro.objects.filter(nome__icontains=query).order_by('nome')[:10]

    opcoes = [{'id': m.id, 'nome': m.nome} for m in membros]

    return Response(opcoes)

class MeusDadosView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        perfil = getattr(request.user, 'perfil', None)
        if not perfil or not perfil.membro:
            return Response({'error': f'Perfil de membro não encontrado para: {request.user.username}'}, status=404)
        serializer = MembroSerializer(perfil.membro)
        return Response(serializer.data)

    def patch(self, request):
        perfil = getattr(request.user, 'perfil', None)
        if not perfil or not perfil.membro:
            return Response({'error': f'Perfil de membro não encontrado para: {request.user.username}'}, status=404)

        # Permitir apenas alguns campos (Endereço, Telefone, Email, Foto)
        campos_permitidos = [
            'telefone', 'email', 'logradouro', 'numero', 'complemento', 'bairro', 
            'cidade', 'uf', 'cep', 'data_nascimento', 'genero', 'estado_civil', 
            'naturalidade', 'data_entrada', 'unidade', 'departamento', 
            'motivo_entrada', 'observacoes', 'funcao', 'foto'
        ]

        data = {k: v for k, v in request.data.items() if k in campos_permitidos}
        serializer = MembroSerializer(perfil.membro, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            
            # Parentesco
            parentescos_raw = request.data.get('parentescos_novo', [])
            if parentescos_raw:
                if isinstance(parentescos_raw, str):
                    try:
                        parentescos_data = json.loads(parentescos_raw)
                    except:
                        parentescos_data = []
                else:
                    parentescos_data = parentescos_raw
                
                _salvar_parentescos_direto(perfil.membro, parentescos_data)

            return Response(serializer.data)

        return Response(serializer.errors, status=400)

class UsuariosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'perfil') or request.user.perfil.role != 'ADMIN':
            return Response({'error': 'Acesso negado'}, status=403)
        
        usuarios = User.objects.all().select_related('perfil__membro').order_by('username')
        data = []
        for u in usuarios:
            nome_exibicao = u.get_full_name()
            # Se o nome no User estiver vazio, tenta pegar do Membro vinculado
            if not nome_exibicao and hasattr(u, 'perfil') and u.perfil.membro:
                nome_exibicao = u.perfil.membro.nome
            
            data.append({
                'id': u.id,
                'username': u.username,
                'nome': nome_exibicao or u.username,
                'role': u.perfil.role if hasattr(u, 'perfil') else 'MEMBRO',
                'is_active': u.is_active
            })
        # Ordena a lista final pelo nome para facilitar a gestão
        data.sort(key=lambda x: x['nome'])
        return Response(data)

    def patch(self, request, pk):
        if not hasattr(request.user, 'perfil') or request.user.perfil.role != 'ADMIN':
            return Response({'error': 'Acesso negado'}, status=403)
        
        try:
            u = User.objects.get(pk=pk)
            role = request.data.get('role')
            if role in ['ADMIN', 'SECRETARIO', 'TESOUREIRO', 'MEMBRO']:
                u.perfil.role = role
                u.perfil.save()
                return Response({'success': True})
            return Response({'error': 'Papel inválido'}, status=400)
        except User.DoesNotExist:
            return Response({'error': 'Usuário não encontrado'}, status=404)

class TrocarSenhaView(APIView):
    """Permite ao usuário logado trocar sua própria senha"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        nova_senha = request.data.get('nova_senha')
        if not nova_senha or len(nova_senha) < 4:
            return Response({"error": "Senha deve ter pelo menos 4 caracteres"}, status=400)
        
        user.set_password(nova_senha)
        user.save()
        return Response({"success": "Senha alterada com sucesso!"})

class ResetarSenhaView(APIView):
    """Reseta a senha para o padrão (Adcapital + 5 primeiros dígitos do CPF) e avisa por email"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        cpf = request.data.get('cpf')
        if not cpf:
            return Response({"error": "CPF é obrigatório"}, status=400)
        
        cpf_limpo = "".join(filter(str.isdigit, cpf))
        user = User.objects.filter(username=cpf_limpo).first()
        
        if not user:
            return Response({"error": "Usuário não encontrado com este CPF"}, status=404)
        
        if len(cpf_limpo) < 5:
            return Response({"error": "CPF inválido"}, status=400)
            
        nova_senha = f"Adcapital{cpf_limpo[:5]}"
        user.set_password(nova_senha)
        user.save()
        
        email_destino = user.email
        if not email_destino and hasattr(user, 'perfil') and user.perfil.membro:
            email_destino = user.perfil.membro.email
            
        if email_destino:
            import threading
            def enviar_bg():
                from django.db import connection, close_old_connections
                try:
                    # Libera conexão para o pool
                    close_old_connections()
                    connection.close()

                    from .utils import enviar_email_resend_api
                    msg = (
                        f"Olá,\n\n"
                        "Conforme solicitado, sua senha de acesso ao Portal AD Capital foi resetada.\n\n"
                        f"Sua NOVA SENHA: {nova_senha}\n\n"
                        "Acesse agora em: https://adcapitaligreja.com.br/#/portal\n\n"
                        "Recomendamos que você altere esta senha assim que entrar no portal.\n\n"
                        "Se você não solicitou esta alteração, procure a secretaria da igreja."
                    )
                    enviar_email_resend_api(
                        to=email_destino, 
                        subject="Senha Resetada - Portal AD Capital", 
                        body=msg
                    )
                except Exception as e:
                    print(f"Erro ao enviar email de reset: {e}")
                finally:
                    try:
                        connection.close()
                    except:
                        pass
            
            threading.Thread(target=enviar_bg).start()
            return Response({"success": f"Senha resetada com sucesso! Instruções enviadas para {email_destino}"})
            
        return Response({"success": "Senha resetada para os 5 últimos dígitos do seu CPF. (Não conseguimos enviar email pois não há endereço cadastrado)"})


class ComentarioPalavraViewSet(viewsets.ModelViewSet):
    queryset = ComentarioPalavra.objects.all()
    serializer_class = ComentarioPalavraSerializer
    permission_classes = [AllowAny]  # GET e POST livres, DELETE protegido no frontend ou aqui

class DevocionalViewSet(viewsets.ModelViewSet):
    queryset = Devocional.objects.all()
    serializer_class = DevocionalSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_permissions(self):
        if self.action == 'destroy':
            return [IsAuthenticated()]
        return [AllowAny()]

import datetime
from .utils import enviar_email_resend_api

@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def verificar_aniversarios(request):
    try:
        hoje = datetime.date.today()
        membros = Membro.objects.filter(
            data_nascimento__month=hoje.month, 
            data_nascimento__day=hoje.day
        ).exclude(ano_ultimo_email_aniversario=hoje.year).exclude(email__isnull=True).exclude(email__exact='')
        
        enviados = 0
        for m in membros:
            html = f"""
            <html><body>
                <h2 style="color: #2563eb;">Feliz Aniversário, {m.nome}! 🎉</h2>
                <p>Nós da <strong>Igreja AD Capital</strong> louvamos a Deus pela sua vida e oramos para que o Senhor derrame ricas bênçãos sobre você neste dia tão especial.</p>
                <p><em>"O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e te conceda paz." (Números 6:24-26)</em></p>
                <p>Um forte abraço da sua família na fé!</p>
            </body></html>
            """
            enviar_email_resend_api(
                para=[m.email],
                assunto=f"Feliz Aniversário, {m.nome}! 🎉",
                html_conteudo=html
            )
            m.ano_ultimo_email_aniversario = hoje.year
            m.save()
            enviados += 1
            
        return Response({'success': True, 'enviados': enviados})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def resetar_senhas_em_massa(request):
    """Endpoint temporário para unificar todas as senhas para o padrão Adcapital + 5 primeiros dígitos do CPF."""
    import re
    atualizados = 0
    erros = []
    for m in Membro.objects.all():
        if not m.cpf:
            continue
        cpf_limpo = "".join(re.findall(r'\d+', m.cpf))
        if not cpf_limpo or len(cpf_limpo) < 5:
            continue
        user = User.objects.filter(username=cpf_limpo).first()
        if not user:
            from .models import Perfil
            p = Perfil.objects.filter(membro=m).first()
            if p:
                user = p.user
        if user:
            nova_senha = f"Adcapital{cpf_limpo[:5]}"
            user.set_password(nova_senha)
            user.save()
            atualizados += 1
    return Response({'success': True, 'atualizados': atualizados, 'erros': erros})
