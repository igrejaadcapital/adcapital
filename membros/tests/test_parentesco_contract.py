import json

from django.test import TestCase
from rest_framework.test import APIClient

from membros.contracts.parentesco import parse_parentescos_novo
from membros.models import Funcao, Membro, Parentesco
from membros.serializers import MembroSerializer
from membros.services.parentesco_service import salvar_parentescos


class ParentescoContractTests(TestCase):
    def test_parse_json_string(self):
        raw = json.dumps([{'parente_id': 2, 'grau': 'PAI_MAE'}])
        items = parse_parentescos_novo(raw)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['membro_destino'], 2)
        self.assertEqual(items[0]['grau'], 'PAI_MAE')

    def test_parse_membro_destino_alias(self):
        items = parse_parentescos_novo([{'membro_destino': 3, 'grau': 'CONJUGE'}])
        self.assertEqual(items[0]['membro_destino'], 3)

    def test_salvar_aceita_parente_id(self):
        a = Membro.objects.create(nome='A', cpf='11111111111', email='a@t.com')
        b = Membro.objects.create(nome='B', cpf='22222222222', email='b@t.com')
        salvar_parentescos(a, [{'parente_id': b.id, 'grau': 'PAI_MAE'}])
        self.assertEqual(Parentesco.objects.filter(membro_origem=a).count(), 1)

    def test_leitura_inclui_parente_id_e_membro_destino(self):
        funcao, _ = Funcao.objects.get_or_create(nome='Membro')
        origem = Membro.objects.create(nome='Origem', cpf='33333333333', email='o@t.com', funcao=funcao)
        destino = Membro.objects.create(nome='Destino', cpf='44444444444', email='d@t.com', funcao=funcao)
        Parentesco.objects.create(membro_origem=origem, membro_destino=destino, grau='FILHO')

        data = MembroSerializer(origem).data
        self.assertEqual(len(data['parentes']), 1)
        parente = data['parentes'][0]
        self.assertEqual(parente['membro_destino'], destino.id)
        self.assertEqual(parente['parente_id'], destino.id)
        self.assertEqual(parente['nome_parente'], 'DESTINO')
        self.assertEqual(parente['grau'], 'FILHO')
