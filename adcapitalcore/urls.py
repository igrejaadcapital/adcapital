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
from membros.views import (
    buscar_opcoes_funcao, 
    buscar_opcoes_parentesco, 
    buscar_configuracao_publica, 
    verificar_resposta_portal, 
    AutoCadastroMembroView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # [PORTAL PUBLIC ROUTES - ROOT LEVEL]
    path('api/portal-config/', buscar_configuracao_publica, name='portal-config'),
    path('api/portal-verificar/', verificar_resposta_portal, name='portal-verificar'),
    path('api/auto-cadastro/', AutoCadastroMembroView.as_view(), name='auto-cadastro'),
    path('api/opcoes-funcao/', buscar_opcoes_funcao, name='opcoes-funcao'),
    path('api/opcoes-parentesco/', buscar_opcoes_parentesco, name='opcoes-parentesco'),

    path('api/financeiro/', include('financeiro.urls')), # Rotas de financeiro
    path('api/agenda/', include('agenda.urls')), # Rotas de agenda
    path('api/', include('membros.urls')),      # Rotas de membros
]