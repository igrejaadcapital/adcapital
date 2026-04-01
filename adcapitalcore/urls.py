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

urlpatterns = [
    # [PORTAL PUBLIC ROUTES - DIRECT DJANGO]
    # Usando caminhos curtíssimos para evitar problemas de roteamento/pending
    path('v/', portal_verificar_resposta_direto, name='portal_v'),
    path('c/', auto_cadastro_direto, name='portal_c'),

    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # [LEGACY API ROUTES]
    path('api/financeiro/', include('financeiro.urls')),
    path('api/agenda/', include('agenda.urls')),
    path('api/', include('membros.urls')),
]