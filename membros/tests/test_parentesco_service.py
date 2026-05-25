from django.test import TestCase

from membros.models import Membro, Parentesco
from membros.services.parentesco_service import salvar_parentescos


class ParentescoServiceTests(TestCase):
    def setUp(self):
        self.a = Membro.objects.create(nome='Membro A', cpf='11111111111', email='a@test.com')
        self.b = Membro.objects.create(nome='Membro B', cpf='22222222222', email='b@test.com')

    def test_salvar_com_membro_destino(self):
        salvar_parentescos(self.a, [{'membro_destino': self.b.id, 'grau': 'PAI_MAE'}])
        self.assertEqual(Parentesco.objects.filter(membro_origem=self.a).count(), 1)
        p = Parentesco.objects.get(membro_origem=self.a)
        self.assertEqual(p.membro_destino_id, self.b.id)

    def test_salvar_com_parente_id(self):
        salvar_parentescos(self.a, [{'parente_id': self.b.id, 'grau': 'PAI_MAE'}])
        self.assertEqual(Parentesco.objects.get(membro_origem=self.a).membro_destino_id, self.b.id)

    def test_lista_vazia_nao_apaga_se_nao_chamar(self):
        Parentesco.objects.create(
            membro_origem=self.a,
            membro_destino=self.b,
            grau='PAI_MAE',
        )
        salvar_parentescos(self.a, [])
        self.assertEqual(Parentesco.objects.filter(membro_origem=self.a).count(), 0)
