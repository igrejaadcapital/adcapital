from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Deixamos o router vazio por enquanto
router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
]