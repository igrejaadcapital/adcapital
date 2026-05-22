from django.urls import path, include
from rest_framework.routers import DefaultRouter

from membros.api.configuracao import (
    ConfiguracaoPortalViewSet,
    ConfiguracaoSiteViewSet,
    FotoGaleriaViewSet,
)
from membros.api.cron import resetar_senhas_em_massa, verificar_aniversarios
from membros.api.funcoes import adicionar_funcao, buscar_opcoes_funcao, excluir_funcao
from membros.api.membros_admin import MembroViewSet, download_termo_lgpd
from membros.api.portal import ComentarioPalavraViewSet, DevocionalViewSet, MeusDadosView
from membros.api.publico import (
    buscar_configuracao_publica,
    buscar_membros_autocomplete_publico,
    buscar_opcoes_parentesco,
    curtir_palavra,
    init_publico,
    init_site,
    ultimo_video_youtube,
)
from membros.api.usuarios import ResetarSenhaView, TrocarSenhaView, UsuariosView

from .view_public import (
    portal_verificar_resposta_direto,
    auto_cadastro_direto
)

# Router para a área administrativa e pública (ViewSets cuidam das permissões)
router = DefaultRouter()
router.register(r'membros', MembroViewSet)
router.register(r'configuracao-portal', ConfiguracaoPortalViewSet, basename='configuracao-portal')
router.register(r'configuracao-site', ConfiguracaoSiteViewSet, basename='configuracao-site')
router.register(r'galeria', FotoGaleriaViewSet, basename='galeria')
router.register(r'comentarios', ComentarioPalavraViewSet, basename='comentarios')
router.register(r'devocionais', DevocionalViewSet, basename='devocionais')

urlpatterns = [
    # Rotas Públicas (Sem autenticação no prefixo /api/)
    path('v/', portal_verificar_resposta_direto, name='portal_v'),
    path('c/', auto_cadastro_direto, name='portal_c'),
    
    # [ENDPOINTS CONSOLIDADOS - PERFORMANCE] Um request em vez de 3-5
    path('init-publico/', init_publico, name='init-publico'),
    path('init-site/', init_site, name='init-site'),
    path('curtir-palavra/', curtir_palavra, name='curtir-palavra'),
    path('verificar-aniversarios/', verificar_aniversarios, name='verificar-aniversarios'),
    path('resetar-senhas-massa/', resetar_senhas_em_massa, name='resetar-senhas-massa'),

    # Rotas legadas (mantidas para compatibilidade)
    path('opcoes-funcao/', buscar_opcoes_funcao, name='opcoes-funcao'),
    path('opcoes-parentesco/', buscar_opcoes_parentesco, name='opcoes-parentesco'),
    path('configuracao-portal/publica/', buscar_configuracao_publica, name='config-publica'),
    path('ultimo-video/', ultimo_video_youtube, name='ultimo-video-youtube'),
    path('opcoes-membros-busca/', buscar_membros_autocomplete_publico, name='opcoes-membros-busca'),

    # Rotas Administrativas
    path('funcoes/', adicionar_funcao, name='adicionar-funcao-admin'),
    path('funcoes/<int:pk>/', excluir_funcao, name='excluir-funcao-admin'),
    path('membros/<int:pk>/download-lgpd/', download_termo_lgpd, name='download-lgpd'),
    
    path('membros/meus-dados/', MeusDadosView.as_view(), name='meus-dados'),
    path('usuarios/', UsuariosView.as_view(), name='usuarios-lista'),
    path('usuarios/<int:pk>/', UsuariosView.as_view(), name='usuario-detalhe'),
    path('auth/trocar-senha/', TrocarSenhaView.as_view(), name='trocar-senha'),
    path('auth/resetar-senha/', ResetarSenhaView.as_view(), name='resetar-senha'),
    path('', include(router.urls)),
]
