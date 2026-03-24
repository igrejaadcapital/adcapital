from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views # Importa tudo que está no seu arquivo views.py

router = DefaultRouter()
# Como importamos o módulo views, usamos views.MembroViewSet
router.register(r'membros', views.MembroViewSet)

urlpatterns = [
    path('opcoes-funcao/', views.opcoes_funcao, name='opcoes-funcao'),
    path('opcoes-parentesco/', views.opcoes_parentesco, name='opcoes-parentesco'),
    path('', include(router.urls)),
]