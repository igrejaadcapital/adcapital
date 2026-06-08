"""Token de curta duração após verificação do portal de cadastro (LGPD)."""
import secrets

from django.core.cache import cache

PORTAL_TOKEN_TTL = 30 * 60
_CACHE_PREFIX = 'portal_cadastro:'


def emitir_token_portal() -> str:
    token = secrets.token_urlsafe(32)
    cache.set(f'{_CACHE_PREFIX}{token}', True, PORTAL_TOKEN_TTL)
    return token


def validar_token_portal(token: str | None) -> bool:
    if not token or not str(token).strip():
        return False
    return cache.get(f'{_CACHE_PREFIX}{token.strip()}') is True
