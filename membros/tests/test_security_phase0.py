"""Testes da Fase 0 — segurança e permissões."""
from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from membros.models import Perfil


class SecurityPhase0Tests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username='11111111111', password='testpass123')
        Perfil.objects.create(user=self.admin, role='ADMIN')
        self.membro_user = User.objects.create_user(username='22222222222', password='testpass123')
        Perfil.objects.create(user=self.membro_user, role='MEMBRO')

    def test_debug_migrate_endpoint_removed(self):
        response = self.client.get('/api/debug/migrate/')
        self.assertEqual(response.status_code, 404)

    @override_settings(DEBUG=True, SECRET_KEY='test-secret-key-for-dev-only')
    def test_financeiro_blocked_for_membro_role(self):
        self.client.force_authenticate(user=self.membro_user)
        response = self.client.get('/api/financeiro/transacoes/')
        self.assertEqual(response.status_code, 403)

    @override_settings(DEBUG=True, SECRET_KEY='test-secret-key-for-dev-only')
    def test_financeiro_allowed_for_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/financeiro/transacoes/')
        self.assertIn(response.status_code, [200, 404])

    @override_settings(DEBUG=True, SECRET_KEY='test-secret-key-for-dev-only')
    def test_resetar_senhas_massa_requires_admin(self):
        response = self.client.get('/api/resetar-senhas-massa/')
        self.assertEqual(response.status_code, 401)

        self.client.force_authenticate(user=self.membro_user)
        response = self.client.get('/api/resetar-senhas-massa/')
        self.assertEqual(response.status_code, 403)

    @override_settings(DEBUG=True, SECRET_KEY='test-secret-key-for-dev-only', CRON_SECRET='cron-test-secret')
    def test_verificar_aniversarios_requires_cron_secret(self):
        response = self.client.get('/api/verificar-aniversarios/')
        self.assertEqual(response.status_code, 403)

        response = self.client.get(
            '/api/verificar-aniversarios/',
            HTTP_X_CRON_SECRET='cron-test-secret',
        )
        self.assertEqual(response.status_code, 200)

    def test_cors_not_allow_all_in_settings(self):
        from django.conf import settings
        self.assertFalse(getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', True))

    def test_jwt_access_token_shorter_than_one_day(self):
        from django.conf import settings
        lifetime = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
        self.assertLessEqual(lifetime.total_seconds(), 3600)
