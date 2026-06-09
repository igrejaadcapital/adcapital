"""Autenticação JWT via header Authorization ou cookie httpOnly."""
from rest_framework_simplejwt.authentication import JWTAuthentication

from membros.api.jwt_cookies import ACCESS_COOKIE
from membros.services.session_revocation import token_revogado_por_corte_global


class CookieJWTAuthentication(JWTAuthentication):
    def get_header(self, request):
        header = super().get_header(request)
        if header:
            return header
        raw = request.COOKIES.get(ACCESS_COOKIE)
        if raw:
            return f'Bearer {raw}'.encode('utf-8')
        return None

    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None
        user, validated_token = result
        if token_revogado_por_corte_global(validated_token):
            return None
        return user, validated_token
