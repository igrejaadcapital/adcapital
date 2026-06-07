from django.contrib.auth.models import User
from django.core.files.storage import FileSystemStorage
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from membros.models import Funcao, Membro
from membros.services.acesso_service import senha_padrao


def _usar_storage_local_lgpd():
    """Cloudinary não está disponível nos testes; usa disco local para lgpd_documento."""
    field = Membro._meta.get_field('lgpd_documento')
    field.storage = FileSystemStorage(location='test_media')


@override_settings(DEBUG=True, SECRET_KEY='test-secret-key-for-dev-only')
class AdminCadastroAcessoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username='11111111111', password='admin-pass')
        self.admin.perfil.role = 'ADMIN'
        self.admin.perfil.save(update_fields=['role'])
        self.client.force_authenticate(user=self.admin)
        self.funcao, _ = Funcao.objects.get_or_create(nome='Membro')
        _usar_storage_local_lgpd()

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


@override_settings(DEBUG=True, SECRET_KEY='test-secret-key-for-dev-only')
class AdminCadastroLgpdTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username='33333333333', password='admin-pass')
        self.admin.perfil.role = 'ADMIN'
        self.admin.perfil.save(update_fields=['role'])
        self.client.force_authenticate(user=self.admin)
        self.funcao, _ = Funcao.objects.get_or_create(nome='Membro')
        _usar_storage_local_lgpd()

    def test_cadastro_admin_gera_termo_lgpd(self):
        payload = {
            'nome': 'Membro Com Termo',
            'cpf': '111.222.333-44',
            'email': 'termo@example.com',
            'funcao': 'Membro',
            'genero': 'M',
            'estado_civil': 'SOLTEIRO',
        }
        res = self.client.post('/api/v1/membros/cadastrar/', payload, format='json')
        self.assertEqual(res.status_code, 201, res.content)

        membro = Membro.objects.get(cpf='11122233344')
        self.assertTrue(bool(membro.lgpd_documento))
        self.assertFalse(membro.lgpd_consentido)

    def test_salvar_membro_sem_termo_gera_pdf(self):
        membro = Membro.objects.create(
            nome='Sem Termo',
            cpf='44455566677',
            funcao=self.funcao,
        )
        self.assertFalse(bool(membro.lgpd_documento))

        res = self.client.patch(
            f'/api/v1/membros/{membro.id}/',
            {'telefone': '61988887777'},
            format='json',
        )
        self.assertEqual(res.status_code, 200, res.content)
        membro.refresh_from_db()
        self.assertTrue(bool(membro.lgpd_documento))
