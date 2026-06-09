"""Cookies httpOnly para JWT (Fase 6)."""
import os

from django.conf import settings

ACCESS_COOKIE = 'adcapital_access'
REFRESH_COOKIE = 'adcapital_refresh'


def jwt_cookie_domain():
    if settings.DEBUG:
        return None
    return os.environ.get('JWT_COOKIE_DOMAIN', '.adcapitaligreja.com.br').strip() or None


def _cookie_kwargs(max_age):
    secure = not settings.DEBUG
    return {
        'httponly': True,
        'secure': secure,
        'samesite': 'None' if secure else 'Lax',
        'domain': jwt_cookie_domain(),
        'max_age': max_age,
        'path': '/',
    }


def set_jwt_cookies(response, access, refresh):
    access_ttl = int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())
    refresh_ttl = int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
    response.set_cookie(ACCESS_COOKIE, access, **_cookie_kwargs(access_ttl))
    response.set_cookie(REFRESH_COOKIE, refresh, **_cookie_kwargs(refresh_ttl))
    return response


def clear_jwt_cookies(response):
    domain = jwt_cookie_domain()
    for name in (ACCESS_COOKIE, REFRESH_COOKIE):
        response.delete_cookie(name, path='/', domain=domain)
        if domain:
            response.delete_cookie(name, path='/', domain=None)
    return response
