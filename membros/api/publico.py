"""Endpoints públicos: site, auto-cadastro e buscas auxiliares."""
import logging
import urllib.request
import xml.etree.ElementTree as ET

from django.core.cache import cache
from django.db import close_old_connections
from rest_framework.decorators import api_view, permission_classes, authentication_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from agenda.models import ProgramacaoSemanal
from agenda.serializers import ProgramacaoSemanalSerializer
from membros.models import ConfiguracaoPortal, ConfiguracaoSite, FotoGaleria, Funcao, Membro, Parentesco
from membros.serializers import ConfiguracaoSiteSerializer, FotoGaleriaSerializer
from membros.services.keep_alive import garantir_keep_alive
from membros.throttles import CurtidasRateThrottle, PortalVerifyRateThrottle

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def init_publico(request):
    garantir_keep_alive()
    try:
        close_old_connections()
        config = ConfiguracaoPortal.objects.filter(id=1).first()
        graus = [{'id': f[0], 'nome': f[1]} for f in Parentesco.GRAU_CHOICES]
        funcoes_list = [{'id': f.id, 'nome': f.nome} for f in Funcao.objects.all().order_by('nome')]
        return Response({
            'portal': {
                'is_ativo': config.is_ativo if config else True,
                'pergunta': config.pergunta if config else 'Qual o seu melhor amigo?',
            },
            'graus': graus,
            'funcoes': funcoes_list,
        })
    except Exception:
        logger.exception('Erro em init_publico')
        return Response({
            'portal': {'is_ativo': True, 'pergunta': 'Qual o seu melhor amigo? (Modo Seguro)'},
            'graus': [{'id': f[0], 'nome': f[1]} for f in Parentesco.GRAU_CHOICES],
            'funcoes': [{'id': 1, 'nome': 'Membro'}],
        })


@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def init_site(request):
    garantir_keep_alive()
    try:
        close_old_connections()
        config = ConfiguracaoSite.objects.filter(id=1).first()
        if not config:
            config, _ = ConfiguracaoSite.objects.get_or_create(id=1)
        return Response({
            'config': ConfiguracaoSiteSerializer(config).data,
            'programacao': ProgramacaoSemanalSerializer(
                ProgramacaoSemanal.objects.all().order_by('dia_semana', 'ordem'),
                many=True,
            ).data,
            'galeria': FotoGaleriaSerializer(
                FotoGaleria.objects.all().order_by('ordem', '-criado_em'),
                many=True,
            ).data,
        })
    except Exception:
        logger.exception('Erro em init_site')
        return Response({'config': {}, 'programacao': [], 'galeria': []})


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
@throttle_classes([CurtidasRateThrottle])
def curtir_palavra(request):
    garantir_keep_alive()
    try:
        close_old_connections()
        config, _ = ConfiguracaoSite.objects.get_or_create(id=1)
        config.curtidas_palavra += 1
        config.save()
        return Response({'success': True, 'curtidas_palavra': config.curtidas_palavra})
    except Exception:
        logger.exception('Erro em curtir_palavra')
        return Response({'error': 'Erro interno no servidor.'}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def ultimo_video_youtube(request):
    cache_key = 'yt_ultimo_video'
    cached = cache.get(cache_key)
    if cached:
        return Response(cached)
    try:
        config = ConfiguracaoSite.objects.filter(id=1).first()
        channel_id = config.youtube_channel_id if config else None
        if not channel_id:
            return Response({'error': 'Canal YouTube não configurado.'}, status=404)
        req = urllib.request.Request(
            f'https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}',
            headers={'User-Agent': 'Mozilla/5.0'},
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            xml_data = resp.read()
        ns = {
            'atom': 'http://www.w3.org/2005/Atom',
            'yt': 'http://www.youtube.com/xml/schemas/2015',
        }
        root = ET.fromstring(xml_data)
        entry = root.find('atom:entry', ns)
        if entry is None:
            return Response({'error': 'Nenhum vídeo encontrado.'}, status=404)
        video_id = entry.find('yt:videoId', ns).text
        data = {
            'video_id': video_id,
            'title': entry.find('atom:title', ns).text,
            'published': entry.find('atom:published', ns).text,
            'thumbnail': f'https://i.ytimg.com/vi/{video_id}/hqdefault.jpg',
            'embed_url': f'https://www.youtube.com/embed/{video_id}',
            'live_embed_url': f'https://www.youtube.com/embed/live?channel={channel_id}',
            'watch_url': f'https://www.youtube.com/watch?v={video_id}',
        }
        cache.set(cache_key, data, 3600)
        return Response(data)
    except Exception:
        logger.exception('Erro em ultimo_video_youtube')
        return Response({'error': 'Erro ao buscar vídeo.'}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def buscar_opcoes_parentesco(request):
    return Response([{'id': f[0], 'nome': f[1]} for f in Parentesco.GRAU_CHOICES])


@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def buscar_configuracao_publica(request):
    try:
        close_old_connections()
        config = ConfiguracaoPortal.objects.filter(id=1).first()
        if not config:
            return Response({'is_ativo': True, 'pergunta': 'Qual o seu melhor amigo?'})
        return Response({'is_ativo': config.is_ativo, 'pergunta': config.pergunta})
    except Exception:
        logger.exception('Erro ao buscar config pública')
        return Response({'is_ativo': True, 'pergunta': 'Qual o seu melhor amigo? (Modo de Segurança)'})


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
@throttle_classes([PortalVerifyRateThrottle])
def verificar_resposta_portal(request):
    resposta_user = request.data.get('resposta', '').strip().lower()
    config = ConfiguracaoPortal.objects.filter(id=1).first()
    resposta_correta = (config.resposta if config else 'Jesus').strip().lower()
    is_ativo = config.is_ativo if config else True
    if not is_ativo:
        return Response({'error': 'O portal de cadastro está desativado no momento.'}, status=403)
    if resposta_user == resposta_correta:
        return Response({'success': True})
    return Response({'success': False, 'error': "Resposta incorreta. Dica: Tente 'Jesus'."}, status=401)


@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def buscar_membros_autocomplete_publico(request):
    query = request.GET.get('q', '').strip()
    if len(query) < 3:
        return Response([])
    membros = Membro.objects.filter(nome__icontains=query).order_by('nome')[:10]
    return Response([{'id': m.id, 'nome': m.nome} for m in membros])
