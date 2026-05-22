# adcapitalcore/urls.py
from django.contrib import admin
from django.urls import path, include

from membros.view_public import auto_cadastro_direto, portal_verificar_resposta_direto

urlpatterns = [
    path('admin/', admin.site.urls),

    # API versionada (contrato estável para web + mobile)
    path('api/v1/', include('adcapitalcore.api_urls')),

    # Legado — mantido até o front usar VITE_API_URL com /api/v1/
    path('api/', include('adcapitalcore.api_urls')),

    # Atalhos na raiz (links curtos históricos de cadastro)
    path('v/', portal_verificar_resposta_direto, name='root_portal_v'),
    path('c/', auto_cadastro_direto, name='root_portal_c'),
    path('v', portal_verificar_resposta_direto),
    path('c', auto_cadastro_direto),
]
