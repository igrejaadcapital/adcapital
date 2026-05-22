"""CORS restrito para views Django puras (cadastro/portal legado)."""
from django.conf import settings


def _allowed_origin(request):
    origin = request.META.get('HTTP_ORIGIN', '').strip()
    if not origin:
        return None
    allowed = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
    if origin in allowed:
        return origin
    return None


def apply_public_cors(request, response):
    origin = _allowed_origin(request)
    if origin:
        response['Access-Control-Allow-Origin'] = origin
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Vary'] = 'Origin'
    response['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response
