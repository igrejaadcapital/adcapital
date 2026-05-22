"""Rate limit simples por IP (cache) para views não-DRF."""
from django.core.cache import cache
from django.http import JsonResponse


def rate_limit_or_none(request, key_prefix, limit=10, period_seconds=60):
    """
    Retorna JsonResponse 429 se o limite foi excedido; None se pode continuar.
    """
    ip = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
    if not ip:
        ip = request.META.get('REMOTE_ADDR', 'unknown')
    cache_key = f'rl:{key_prefix}:{ip}'
    count = cache.get(cache_key, 0)
    if count >= limit:
        return JsonResponse(
            {'error': 'Muitas tentativas. Aguarde um momento e tente novamente.'},
            status=429,
        )
    cache.set(cache_key, count + 1, period_seconds)
    return None
