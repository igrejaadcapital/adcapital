from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransacaoViewSet, DashboardAPIView, CategoriaFinanceiraViewSet, ImportarOFXView
from .views_export import ExportarContabilidadeAPIView

router = DefaultRouter()
router.register(r'transacoes', TransacaoViewSet)
router.register(r'categorias', CategoriaFinanceiraViewSet)

urlpatterns = [
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
    path('importar-ofx/', ImportarOFXView.as_view(), name='importar-ofx'),
    path('exportar-contabilidade/', ExportarContabilidadeAPIView.as_view(), name='exportar-contabilidade'),
    path('', include(router.urls)),
]