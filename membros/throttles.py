"""Limites de taxa para login, cadastro público e reset de senha."""
from rest_framework.throttling import AnonRateThrottle, SimpleRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'


class CadastroRateThrottle(AnonRateThrottle):
    scope = 'cadastro'


class ResetSenhaRateThrottle(AnonRateThrottle):
    scope = 'reset_senha'


class CurtidasRateThrottle(AnonRateThrottle):
    scope = 'curtidas'


class PortalVerifyRateThrottle(SimpleRateThrottle):
    """Limite por IP nas rotas públicas de cadastro/portal."""
    scope = 'portal_verify'

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return None
        ident = self.get_ident(request)
        return self.cache_format % {'scope': self.scope, 'ident': ident}


class MembrosBuscaRateThrottle(SimpleRateThrottle):
    """Limite por IP na busca de membros durante auto-cadastro."""
    scope = 'membros_busca'

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return None
        ident = self.get_ident(request)
        return self.cache_format % {'scope': self.scope, 'ident': ident}
