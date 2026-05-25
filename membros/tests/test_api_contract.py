import json

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from membros.models import ConfiguracaoPortal, Funcao, Membro


@override_settings(DEBUG=True, SECRET_KEY='test-secret-key-for-dev-only')
class LoginContractTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='99988877766', password='senha-pastoral-123')
        self.user.perfil.role = 'ADMIN'
        self.user.perfil.save(update_fields=['role'])

    def test_login_v1_retorna_tokens(self):
        res = self.client.post(
            '/api/v1/token/',
            {'username': '999.888.777-66', 'password': 'senha-pastoral-123'},
            format='json',
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn('access', data)
        self.assertIn('refresh', data)
        self.assertEqual(data.get('role'), 'ADMIN')

    def test_login_credenciais_invalidas_401(self):
        res = self.client.post(
            '/api/v1/token/',
            {'username': '99988877766', 'password': 'errada'},
            format='json',
        )
        self.assertEqual(res.status_code, 401)

    def test_login_legacy_prefixo_igual_v1(self):
        v1 = self.client.post(
            '/api/v1/token/',
            {'username': '99988877766', 'password': 'senha-pastoral-123'},
            format='json',
        )
        legacy = self.client.post(
            '/api/token/',
            {'username': '99988877766', 'password': 'senha-pastoral-123'},
            format='json',
        )
        self.assertEqual(v1.status_code, 200)
        self.assertEqual(legacy.status_code, 200)
        self.assertIn('access', legacy.json())


@override_settings(DEBUG=True, SECRET_KEY='test-secret-key-for-dev-only')
class CadastroPublicoContractTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        ConfiguracaoPortal.objects.get_or_create(
            id=1,
            defaults={'is_ativo': True, 'pergunta': 'Nome?', 'resposta': 'Jesus'},
        )
        self.funcao, _ = Funcao.objects.get_or_create(nome='Membro')
        self.payload = {
            'nome': 'Maria Teste',
            'cpf': '555.666.777-88',
            'sync_resposta': 'jesus',
            'email': 'maria@example.com',
            'funcao': self.funcao.id,
            'genero': 'F',
            'estado_civil': 'SOLTEIRO',
            'cidade': 'Brasília',
            'uf': 'DF',
        }

    def test_cadastro_v1_c_endpoint(self):
        res = self.client.post(
            '/api/v1/c/',
            json.dumps(self.payload),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json().get('success'))
        self.assertTrue(Membro.objects.filter(cpf='55566677788').exists())

    def test_cadastro_com_parentesco_parente_id(self):
        parente = Membro.objects.create(
            nome='Pai Cadastro',
            cpf='12312312312',
            email='pai@example.com',
            funcao=self.funcao,
        )
        payload = {
            **self.payload,
            'cpf': '666.777.888-99',
            'parentescos_novo': json.dumps([{'parente_id': parente.id, 'grau': 'PAI_MAE'}]),
        }
        res = self.client.post(
            '/api/v1/c/',
            json.dumps(payload),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        membro = Membro.objects.get(cpf='66677788899')
        self.assertEqual(membro.parentescos.count(), 1)


@override_settings(DEBUG=True, SECRET_KEY='test-secret-key-for-dev-only')
class FinanceiroRbacContractTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username='11111111111', password='testpass123')
        self.admin.perfil.role = 'ADMIN'
        self.admin.perfil.save(update_fields=['role'])
        self.membro_user = User.objects.create_user(username='22222222222', password='testpass123')
        self.membro_user.perfil.role = 'MEMBRO'
        self.membro_user.perfil.save(update_fields=['role'])

    def test_financeiro_membro_403_v1(self):
        self.client.force_authenticate(user=self.membro_user)
        res = self.client.get('/api/v1/financeiro/transacoes/')
        self.assertEqual(res.status_code, 403)

    def test_financeiro_admin_ok_v1(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/v1/financeiro/transacoes/')
        self.assertIn(res.status_code, [200, 404])

    def test_financeiro_anonimo_401_v1(self):
        res = self.client.get('/api/v1/financeiro/transacoes/')
        self.assertEqual(res.status_code, 401)
