# adcapitalcore/urls.py
from django.contrib import admin
from django.urls import path, include

from membros.api.membros_admin import AutoCadastroMembroView
from membros.api.publico import verificar_resposta_portal

urlpatterns = [
    path('admin/', admin.site.urls),

    # API versionada (contrato estável para web + mobile)
    path('api/v1/', include('adcapitalcore.api_v1_urls')),

    # Legado — mantido até o front usar VITE_API_URL com /api/v1/
    path('api/', include('adcapitalcore.api_urls')),

    # Atalhos na raiz (links curtos históricos de cadastro)
    path('v/', verificar_resposta_portal, name='root_portal_v'),
    path('c/', AutoCadastroMembroView.as_view(), name='root_portal_c'),
    path('v', verificar_resposta_portal),
    path('c', AutoCadastroMembroView.as_view()),
]
