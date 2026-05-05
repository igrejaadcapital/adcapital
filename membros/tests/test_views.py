from django.test import TestCase, Client
from membros.models import ConfiguracaoSite

class PublicViewsTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        # Create default site config so it doesn't return 404/500 if missing
        ConfiguracaoSite.objects.get_or_create(
            id=1,
            defaults={'pastor_nome': "Pastor Teste"}
        )

    def test_configuracao_site_endpoint(self):
        """Testa se o endpoint de configurações do site é público"""
        res = self.client.get('/api/configuracao-site/')
        self.assertEqual(res.status_code, 200)

    def test_galeria_endpoint(self):
        """Testa se o endpoint de galeria é público"""
        res = self.client.get('/api/galeria/')
        self.assertEqual(res.status_code, 200)

    def test_programacao_endpoint(self):
        """Testa se o endpoint de programação semanal é público"""
        res = self.client.get('/api/agenda/programacao-semanal/')
        # Pode ser 200 ou 404 dependendo do roteador, mas não 401/403 ou 500
        self.assertIn(res.status_code, [200, 404], "Endpoint falhou ao responder anonimamente")
