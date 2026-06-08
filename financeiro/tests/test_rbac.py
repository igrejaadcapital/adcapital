from datetime import date
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from financeiro.models import Transacao


@override_settings(DEBUG=True, SECRET_KEY='test-secret-key-for-dev-only')
class FinanceiroRbacTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.tesoureiro = User.objects.create_user(username='33333333333', password='tes-pass')
        self.tesoureiro.perfil.role = 'TESOUREIRO'
        self.tesoureiro.perfil.save(update_fields=['role'])
        self.membro = User.objects.create_user(username='44444444444', password='membro-pass')
        self.membro.perfil.role = 'MEMBRO'
        self.membro.perfil.save(update_fields=['role'])
        Transacao.objects.create(
            descricao='Oferta',
            valor=Decimal('50.00'),
            tipo='ENTRADA',
            categoria='Oferta',
            data=date(2026, 5, 15),
        )

    def test_listar_transacoes_tesoureiro_ok(self):
        self.client.force_authenticate(user=self.tesoureiro)
        res = self.client.get('/api/v1/financeiro/transacoes/')
        self.assertEqual(res.status_code, 200, res.content)

    def test_listar_transacoes_membro_negado(self):
        self.client.force_authenticate(user=self.membro)
        res = self.client.get('/api/v1/financeiro/transacoes/')
        self.assertEqual(res.status_code, 403)

    def test_dashboard_financeiro_membro_negado(self):
        self.client.force_authenticate(user=self.membro)
        res = self.client.get('/api/v1/financeiro/dashboard/')
        self.assertEqual(res.status_code, 403)
