"""
URL configuration for adcapitalcore project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
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
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # [PORTAL PUBLIC ROUTES - DIRECT DJANGO]
    path('portal/verificar/', portal_verificar_resposta_direto, name='portal_verificar_direto'),
    path('portal/auto-cadastro/', auto_cadastro_direto, name='portal_auto_cadastro_direto'),

    # [LEGACY API ROUTES]
    path('api/financeiro/', include('financeiro.urls')), # Rotas de financeiro
    path('api/agenda/', include('agenda.urls')), # Rotas de agenda
    path('api/', include('membros.urls')),      # Rotas de membros
]