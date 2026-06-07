from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from membros.models import Funcao, Membro
from membros.services.acesso_service import senha_padrao


@override_settings(DEBUG=True, SECRET_KEY='test-secret-key-for-dev-only')
class AdminCadastroAcessoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username='11111111111', password='admin-pass')
        self.admin.perfil.role = 'ADMIN'
        self.admin.perfil.save(update_fields=['role'])
        self.client.force_authenticate(user=self.admin)
        self.funcao, _ = Funcao.objects.get_or_create(nome='Membro')

    def test_cadastro_admin_cria_usuario_e_permite_login(self):
        cpf = '01561969648'
        payload = {
            'nome': 'Novo Membro Teste',
            'cpf': '015.619.696-48',
            'email': 'novo@example.com',
            'funcao': 'Membro',
            'genero': 'M',
            'estado_civil': 'SOLTEIRO',
        }
        res = self.client.post('/api/v1/membros/cadastrar/', payload, format='json')
        self.assertEqual(res.status_code, 201, res.content)

        membro = Membro.objects.get(cpf=cpf)
        user = User.objects.filter(username=cpf).first()
        self.assertIsNotNone(user)
        self.assertEqual(user.perfil.membro_id, membro.id)
        self.assertEqual(user.perfil.role, 'MEMBRO')

        login = APIClient().post(
            '/api/v1/token/',
            {'username': cpf, 'password': senha_padrao(cpf)},
            format='json',
        )
        self.assertEqual(login.status_code, 200, login.content)
        self.assertEqual(login.json().get('role'), 'MEMBRO')

    def test_salvar_membro_existente_sem_usuario_provisiona_acesso(self):
        cpf = '98765432100'
        membro = Membro.objects.create(
            nome='Sem Login',
            cpf=cpf,
            email='sem@example.com',
            funcao=self.funcao,
        )
        self.assertFalse(User.objects.filter(username=cpf).exists())

        res = self.client.patch(
            f'/api/v1/membros/{membro.id}/',
            {'telefone': '61999999999'},
            format='json',
        )
        self.assertEqual(res.status_code, 200, res.content)
        self.assertTrue(User.objects.filter(username=cpf).exists())
