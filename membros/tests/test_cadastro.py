import json
from django.test import TestCase, Client
from membros.models import Membro, ConfiguracaoPortal, Funcao

class CadastroMembroTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        # Setup configs needed for registration
        self.config, _ = ConfiguracaoPortal.objects.get_or_create(
            id=1,
            defaults={
                'is_ativo': True,
                'pergunta': "Nome do salvador?",
                'resposta': "Jesus"
            }
        )
        self.funcao_membro, _ = Funcao.objects.get_or_create(nome="Membro")

        self.payload_valido = {
            'nome': 'João da Silva',
            'cpf': '111.222.333-44',
            'sync_resposta': 'jesus',
            'email': 'joao@example.com',
            'funcao': self.funcao_membro.id,
            'genero': 'M',
            'estado_civil': 'SOLTEIRO',
            'cidade': 'Brasília',
            'uf': 'DF',
        }

    def test_cadastro_sucesso(self):
        """Testa se o cadastro funciona corretamente com dados válidos"""
        res = self.client.post('/api/v1/c/', json.dumps(self.payload_valido), content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get('success'))
        
        # Verifica se salvou no banco
        membro = Membro.objects.get(cpf='11122233344')
        self.assertEqual(membro.nome, 'JOÃO DA SILVA')

    def test_cadastro_falha_resposta_seguranca(self):
        """Testa se o sistema barra cadastro com resposta de segurança incorreta"""
        payload = self.payload_valido.copy()
        payload['sync_resposta'] = 'errada'
        
        res = self.client.post('/api/v1/c/', json.dumps(payload), content_type='application/json')
        self.assertEqual(res.status_code, 401)
        data = res.json()
        self.assertIn('Acesso negado', data.get('error', ''))

    def test_patch_membro_existente(self):
        """Testa a lógica de atualização parcial (patch) para membros existentes (CPF igual)"""
        # Cria membro inicial
        Membro.objects.create(
            nome='Nome Antigo',
            cpf='11122233344',
            email='antigo@example.com',
            funcao=self.funcao_membro
        )

        payload_patch = {
            'nome': 'Nome Novo',
            'cpf': '111.222.333-44',
            'sync_resposta': 'jesus',
            # Omitindo o e-mail propositalmente para ver se não é apagado
        }

        res = self.client.post('/api/v1/c/', json.dumps(payload_patch), content_type='application/json')
        self.assertEqual(res.status_code, 200)

        # Verifica se o nome mudou mas o email continuou o mesmo
        membro = Membro.objects.get(cpf='11122233344')
        self.assertEqual(membro.nome, 'NOME NOVO')
        self.assertEqual(membro.email, 'antigo@example.com')
