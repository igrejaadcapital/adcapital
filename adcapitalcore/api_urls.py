"""
Rotas da API REST (versão estável).

Montadas em /api/v1/ (recomendado) e em /api/ (legado).
"""
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

from analytics.dashboard_views import ConsolidatedDashboardView
from membros.api.auth import CustomTokenObtainPairView, health_check, ping_view
from membros.view_public import auto_cadastro_direto, portal_verificar_resposta_direto

urlpatterns = [
    path('dashboard/resumo/', ConsolidatedDashboardView.as_view(), name='dashboard-resumo'),
    path('health/', health_check, name='health-check'),
    path('ping/', ping_view, name='ping'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Atalhos de cadastro público (api/v1/v/ e api/v1/c/)
    path('v/', portal_verificar_resposta_direto, name='portal_v'),
    path('c/', auto_cadastro_direto, name='portal_c'),
    path('v', portal_verificar_resposta_direto),
    path('c', auto_cadastro_direto),
    path('financeiro/', include('financeiro.urls')),
    path('agenda/', include('agenda.urls')),
    path('analytics/', include('analytics.urls')),
    path('', include('membros.urls')),
]
