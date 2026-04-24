# adcapitalcore/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from membros.view_public import (
    portal_verificar_resposta_direto,
    auto_cadastro_direto
)
from membros.views import run_migrations_debug

urlpatterns = [
    # [PORTAL PUBLIC ROUTES - ROBUST MAPPING]
    # Mapeamento redundante para garantir que NUNCA dê 404 em produção
    path('v/', portal_verificar_resposta_direto, name='portal_v'),
    path('c/', auto_cadastro_direto, name='portal_c'),
    path('v', portal_verificar_resposta_direto), # Versão sem barra
    path('c', auto_cadastro_direto),
    
    # Reforço de prefixo api/ na raiz (caso o include falhe ou demore)
    path('api/v/', portal_verificar_resposta_direto),
    path('api/c/', auto_cadastro_direto),
    path('api/v', portal_verificar_resposta_direto),
    path('api/c', auto_cadastro_direto),
    path('api/debug/migrate/', run_migrations_debug),

    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # [LEGACY API ROUTES]
    path('api/financeiro/', include('financeiro.urls')),
    path('api/agenda/', include('agenda.urls')),
    path('api/', include('membros.urls')),
]