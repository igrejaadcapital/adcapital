from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient


@override_settings(DEBUG=True, SECRET_KEY='test-secret-key-for-dev-only')
class ConsolidatedDashboardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username='11111111111', password='admin-pass')
        self.admin.perfil.role = 'ADMIN'
        self.admin.perfil.save(update_fields=['role'])

    def test_dashboard_resumo_requer_autenticacao(self):
        res = self.client.get('/api/v1/dashboard/resumo/')
        self.assertEqual(res.status_code, 401)

    def test_dashboard_resumo_admin_retorna_estrutura(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/v1/dashboard/resumo/')
        self.assertEqual(res.status_code, 200, res.content)
        data = res.json()
        self.assertEqual(data.get('status'), 'success')
        self.assertIn('home', data)
        self.assertIn('analytics', data)
        self.assertIn('total_membros', data['home'])
        self.assertIn('crescimento_membros', data['analytics'])

    def test_dashboard_resumo_membro_negado(self):
        membro = User.objects.create_user(username='22222222222', password='membro-pass')
        membro.perfil.role = 'MEMBRO'
        membro.perfil.save(update_fields=['role'])
        self.client.force_authenticate(user=membro)
        res = self.client.get('/api/v1/dashboard/resumo/')
        self.assertEqual(res.status_code, 403)
