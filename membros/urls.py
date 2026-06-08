from django.urls import path, include
from rest_framework.routers import DefaultRouter

from membros.api.configuracao import (
    ConfiguracaoPortalViewSet,
    ConfiguracaoSiteViewSet,
    FotoGaleriaViewSet,
)
from membros.api.cron import resetar_senhas_em_massa, verificar_aniversarios
from membros.api.funcoes import adicionar_funcao, buscar_opcoes_funcao, excluir_funcao
from membros.api.membros_admin import (
    AutoCadastroMembroView,
    MembroViewSet,
    download_termo_lgpd,
    download_termo_lgpd_em_branco,
)
from membros.api.portal import ComentarioPalavraViewSet, DevocionalViewSet, MeusDadosView
from membros.api.publico import (
    buscar_configuracao_publica,
    buscar_membros_autocomplete_publico,
    buscar_opcoes_parentesco,
    curtir_palavra,
    init_publico,
    init_site,
    ultimo_video_youtube,
    verificar_resposta_portal,
)
from membros.api.usuarios import ResetarSenhaView, TrocarSenhaView, UsuariosView

# Router para a área administrativa e pública (ViewSets cuidam das permissões)
router = DefaultRouter()
router.register(r'membros', MembroViewSet)
router.register(r'configuracao-portal', ConfiguracaoPortalViewSet, basename='configuracao-portal')
router.register(r'configuracao-site', ConfiguracaoSiteViewSet, basename='configuracao-site')
router.register(r'galeria', FotoGaleriaViewSet, basename='galeria')
router.register(r'comentarios', ComentarioPalavraViewSet, basename='comentarios')
router.register(r'devocionais', DevocionalViewSet, basename='devocionais')

urlpatterns = [
    # Auto-cadastro público (DRF — substitui view_public legado)
    path('v/', verificar_resposta_portal, name='portal_v'),
    path('c/', AutoCadastroMembroView.as_view(), name='portal_c'),
    
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
    path('membros/termo-lgpd-em-branco/', download_termo_lgpd_em_branco, name='download-lgpd-em-branco'),
    path('membros/<int:pk>/download-lgpd/', download_termo_lgpd, name='download-lgpd'),
    
    path('membros/meus-dados/', MeusDadosView.as_view(), name='meus-dados'),
    path('usuarios/', UsuariosView.as_view(), name='usuarios-lista'),
    path('usuarios/<int:pk>/', UsuariosView.as_view(), name='usuario-detalhe'),
    path('auth/trocar-senha/', TrocarSenhaView.as_view(), name='trocar-senha'),
    path('auth/resetar-senha/', ResetarSenhaView.as_view(), name='resetar-senha'),
    path('', include(router.urls)),
]
