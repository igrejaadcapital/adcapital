# v1.1.3 - Rotas Administrativas Apenas
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MembroViewSet, 
    ConfiguracaoPortalViewSet,
    excluir_funcao
)

# Router para a área administrativa
router = DefaultRouter()
router.register(r'membros', MembroViewSet)
router.register(r'configuracao-portal', ConfiguracaoPortalViewSet, basename='configuracao-portal')

urlpatterns = [
    # Rotas Administrativas
    path('funcoes/<int:pk>/', excluir_funcao, name='excluir-funcao-admin'),
    path('', include(router.urls)),
]