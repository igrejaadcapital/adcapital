"""Autenticação JWT via header Authorization ou cookie httpOnly."""
from rest_framework_simplejwt.authentication import JWTAuthentication

from membros.api.jwt_cookies import ACCESS_COOKIE


class CookieJWTAuthentication(JWTAuthentication):
    def get_header(self, request):
        header = super().get_header(request)
        if header:
            return header
        raw = request.COOKIES.get(ACCESS_COOKIE)
        if raw:
            return f'Bearer {raw}'.encode('utf-8')
        return None
