from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MembroViewSet, 
    ConfiguracaoPortalViewSet,
    ConfiguracaoSiteViewSet,
    FotoGaleriaViewSet,
    excluir_funcao,
    adicionar_funcao,
    buscar_opcoes_funcao,
    buscar_opcoes_parentesco,
    buscar_configuracao_publica,
    download_termo_lgpd,
    ultimo_video_youtube
)

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

urlpatterns = [
    # Rotas Públicas (Sem autenticação no prefixo /api/)
    path('v/', portal_verificar_resposta_direto, name='portal_v'),
    path('c/', auto_cadastro_direto, name='portal_c'),
    
    # Novas rotas para o Dashboard Admin e Site Público
    path('opcoes-funcao/', buscar_opcoes_funcao, name='opcoes-funcao'),
    path('opcoes-parentesco/', buscar_opcoes_parentesco, name='opcoes-parentesco'),
    path('configuracao-portal/publica/', buscar_configuracao_publica, name='config-publica'),
    path('ultimo-video/', ultimo_video_youtube, name='ultimo-video-youtube'),

    # Rotas Administrativas
    path('funcoes/', adicionar_funcao, name='adicionar-funcao-admin'),
    path('funcoes/<int:pk>/', excluir_funcao, name='excluir-funcao-admin'),
    path('membros/<int:pk>/download-lgpd/', download_termo_lgpd, name='download-lgpd'),
    path('', include(router.urls)),
]