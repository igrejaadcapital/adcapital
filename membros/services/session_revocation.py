"""Revogação global de sessões JWT (marca tokens emitidos antes de um instante)."""
import time

from django.core.cache import cache

CACHE_KEY = 'adcapital_jwt_invalidate_before_ts'
# Sem expiração prática — revogação global deve persistir no DatabaseCache.
CACHE_TIMEOUT = None


def marcar_revogacao_global() -> int:
    """Invalida access tokens emitidos até este instante (inclusive)."""
    # +1 garante que tokens do mesmo segundo da revogação também caiam.
    ts = int(time.time()) + 1
    cache.set(CACHE_KEY, ts, timeout=CACHE_TIMEOUT)
    return ts


def get_invalidate_before_ts() -> int:
    return int(cache.get(CACHE_KEY) or 0)


def token_revogado_por_corte_global(token) -> bool:
    threshold = get_invalidate_before_ts()
    if not threshold:
        return False
    iat = token.get('iat')
    if iat is None:
        return True
    return int(iat) < threshold
