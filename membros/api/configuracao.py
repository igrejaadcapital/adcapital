"""ViewSets de configuração do portal e do site."""
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from membros.models import ConfiguracaoPortal, ConfiguracaoSite, FotoGaleria
from membros.permissions import IsAdmin, IsAdminOrSecretario
from membros.serializers import (
    ConfiguracaoPortalSerializer,
    ConfiguracaoSiteSerializer,
    FotoGaleriaSerializer,
)


class ConfiguracaoPortalViewSet(viewsets.ModelViewSet):
    queryset = ConfiguracaoPortal.objects.all()
    serializer_class = ConfiguracaoPortalSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdmin()]

    def list(self, request, *args, **kwargs):
        config = ConfiguracaoPortal.objects.filter(id=1).first()
        if not config:
            config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)
        return Response(self.get_serializer(config).data)

    def update(self, request, *args, **kwargs):
        config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)
        serializer = self.get_serializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ConfiguracaoSiteViewSet(viewsets.ModelViewSet):
    queryset = ConfiguracaoSite.objects.all()
    serializer_class = ConfiguracaoSiteSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdmin()]

    def list(self, request, *args, **kwargs):
        config = ConfiguracaoSite.objects.filter(id=1).first()
        if not config:
            config, _ = ConfiguracaoSite.objects.get_or_create(id=1)
        return Response(self.get_serializer(config).data)

    def update(self, request, *args, **kwargs):
        config, _ = ConfiguracaoSite.objects.get_or_create(id=1)
        serializer = self.get_serializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class FotoGaleriaViewSet(viewsets.ModelViewSet):
    queryset = FotoGaleria.objects.all().order_by('ordem', '-criado_em')
    serializer_class = FotoGaleriaSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminOrSecretario()]
