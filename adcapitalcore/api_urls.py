"""
Rotas da API REST (versão estável).

Montadas em /api/v1/ (recomendado) e em /api/ (legado).
"""
from django.urls import path, include
from analytics.dashboard_views import ConsolidatedDashboardView
from membros.api.auth import (
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    auth_logout,
    auth_me,
    health_check,
    ping_view,
)
from membros.api.membros_admin import AutoCadastroMembroView
from membros.api.publico import verificar_resposta_portal

urlpatterns = [
    path('dashboard/resumo/', ConsolidatedDashboardView.as_view(), name='dashboard-resumo'),
    path('health/', health_check, name='health-check'),
    path('ping/', ping_view, name='ping'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', auth_me, name='auth_me'),
    path('auth/logout/', auth_logout, name='auth_logout'),
    # Atalhos de cadastro público (api/v1/v/ e api/v1/c/)
    path('v/', verificar_resposta_portal, name='portal_v'),
    path('c/', AutoCadastroMembroView.as_view(), name='portal_c'),
    path('v', verificar_resposta_portal),
    path('c', AutoCadastroMembroView.as_view()),
    path('financeiro/', include('financeiro.urls')),
    path('agenda/', include('agenda.urls')),
    path('analytics/', include('analytics.urls')),
    path('', include('membros.urls')),
]
