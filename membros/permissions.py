"""Permissões por papel (Perfil.role) para a API AD Capital."""
import os
import secrets

from django.conf import settings
from rest_framework import permissions


def _cron_secret():
    return (os.environ.get('CRON_SECRET', '') or getattr(settings, 'CRON_SECRET', '')).strip()


def get_user_role(user):
    if not user or not user.is_authenticated:
        return None
    perfil = getattr(user, 'perfil', None)
    return perfil.role if perfil else 'MEMBRO'


class _RolePermission(permissions.BasePermission):
    allowed_roles = ()

    def has_permission(self, request, view):
        return get_user_role(request.user) in self.allowed_roles


class IsAdmin(_RolePermission):
    allowed_roles = ('ADMIN',)


class IsSecretario(_RolePermission):
    allowed_roles = ('SECRETARIO',)


class IsTesoureiro(_RolePermission):
    allowed_roles = ('TESOUREIRO',)


class IsAdminOrSecretario(_RolePermission):
    allowed_roles = ('ADMIN', 'SECRETARIO')


class IsFinanceStaff(_RolePermission):
    allowed_roles = ('ADMIN', 'TESOUREIRO')


class IsStaffChurch(_RolePermission):
    """Papéis com acesso ao painel administrativo (não portal de membro)."""
    allowed_roles = ('ADMIN', 'SECRETARIO', 'TESOUREIRO')


class HasCronSecret(permissions.BasePermission):
    """Protege endpoints de tarefas agendadas (cron-job.org, etc.)."""

    def has_permission(self, request, view):
        expected = _cron_secret()
        if not expected:
            return False
        provided = (
            request.headers.get('X-Cron-Secret')
            or request.META.get('HTTP_X_CRON_SECRET')
            or request.GET.get('secret', '')
        )
        return secrets.compare_digest(expected, str(provided))
