from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from membros.models import ConfiguracaoPortal, Funcao, Membro
from membros.services.portal_token_service import emitir_token_portal


@override_settings(DEBUG=True, SECRET_KEY='test-secret-key-for-dev-only')
class PortalAutocompleteLgpdTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        ConfiguracaoPortal.objects.get_or_create(
            id=1,
            defaults={'is_ativo': True, 'pergunta': 'Nome do salvador?', 'resposta': 'Jesus'},
        )
        self.funcao, _ = Funcao.objects.get_or_create(nome='Membro')
        Membro.objects.create(
            nome='MARIA DA SILVA',
            cpf='12345678901',
            funcao=self.funcao,
            status='LIGADO',
        )
        Membro.objects.create(
            nome='MARIA INATIVA',
            cpf='12345678902',
            funcao=self.funcao,
            status='DESLIGADO',
        )

    def test_busca_sem_token_retorna_403(self):
        res = self.client.get('/api/opcoes-membros-busca/?q=maria')
        self.assertEqual(res.status_code, 403)

    def test_verificacao_portal_retorna_token(self):
        res = self.client.post('/api/v/', {'resposta': 'Jesus'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json().get('portal_token'))

    def test_busca_com_token_retorna_apenas_ligados(self):
        token = emitir_token_portal()
        res = self.client.get(
            '/api/opcoes-membros-busca/?q=maria',
            HTTP_X_PORTAL_TOKEN=token,
        )
        self.assertEqual(res.status_code, 200)
        nomes = [item['nome'] for item in res.json()]
        self.assertIn('MARIA DA SILVA', nomes)
        self.assertNotIn('MARIA INATIVA', nomes)
