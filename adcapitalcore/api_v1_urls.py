"""
Rotas exclusivas de /api/v1/ (OpenAPI + API REST).
"""
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path('schema/', SpectacularAPIView.as_view(), name='api-schema'),
    path(
        'docs/',
        SpectacularSwaggerView.as_view(url='/api/v1/schema/'),
        name='api-docs',
    ),
    path(
        'redoc/',
        SpectacularRedocView.as_view(url='/api/v1/schema/'),
        name='api-redoc',
    ),
    path('', include('adcapitalcore.api_urls')),
]
