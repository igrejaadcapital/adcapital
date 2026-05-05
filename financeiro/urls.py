from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransacaoViewSet, DashboardAPIView, CategoriaFinanceiraViewSet, ImportarOFXView

router = DefaultRouter()
router.register(r'transacoes', TransacaoViewSet)
router.register(r'categorias', CategoriaFinanceiraViewSet)

urlpatterns = [
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
    path('importar-ofx/', ImportarOFXView.as_view(), name='importar-ofx'),
    path('', include(router.urls)),
]