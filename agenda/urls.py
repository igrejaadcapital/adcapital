from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventoViewSet, StatusSincronizacaoView

router = DefaultRouter()
router.register(r'eventos', EventoViewSet, basename='evento')

urlpatterns = [
    path('status/', StatusSincronizacaoView.as_view(), name='status-sincronizacao'),
    path('', include(router.urls)),
]
