# v1.1.2 - Correção do Seletor Dinâmico
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MembroViewSet, 
    ConfiguracaoPortalViewSet,
    buscar_opcoes_funcao, 
    buscar_opcoes_parentesco, 
    excluir_funcao,
    buscar_configuracao_publica,
    verificar_resposta_portal,
    AutoCadastroMembroView
)

router = DefaultRouter()
router.register(r'membros', MembroViewSet)
router.register(r'configuracao-portal', ConfiguracaoPortalViewSet, basename='configuracao-portal')

urlpatterns = [
    path('opcoes-funcao/', buscar_opcoes_funcao, name='opcoes-funcao'),
    path('funcoes/<int:pk>/', excluir_funcao, name='excluir-funcao'),
    path('opcoes-parentesco/', buscar_opcoes_parentesco, name='opcoes-parentesco'),
    
    # [PORTAL PUBLIC ROUTES]
    path('portal-config/', buscar_configuracao_publica, name='portal-config-publica'),
    path('portal-verificar/', verificar_resposta_portal, name='portal-verificar-resposta'),
    path('auto-cadastro/', AutoCadastroMembroView.as_view(), name='membro-auto-cadastro'),
    
    path('', include(router.urls)),
]