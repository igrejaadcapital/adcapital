from datetime import date
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from financeiro.models import Transacao


@override_settings(DEBUG=True, SECRET_KEY='test-secret-key-for-dev-only')
class ExportarContabilidadeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='11111111111', password='testpass123')
        self.user.perfil.role = 'ADMIN'
        self.user.perfil.save(update_fields=['role'])
        self.client.force_authenticate(user=self.user)
        Transacao.objects.create(
            descricao='Dízimo',
            valor=Decimal('100.00'),
            tipo='ENTRADA',
            categoria='Dízimo',
            data=date(2026, 5, 10),
        )

    def test_exportar_contabilidade_retorna_xlsx(self):
        res = self.client.get(
            '/api/v1/financeiro/exportar-contabilidade/',
            {
                'data_inicio': '2026-05-01',
                'data_fim': '2026-05-31',
                'tipo': 'TODOS',
            },
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn(
            'spreadsheetml',
            res['Content-Type'],
        )
        self.assertGreater(len(res.content), 100)
        self.assertIn('attachment', res['Content-Disposition'])

    def test_exportar_periodo_invalido_400(self):
        res = self.client.get(
            '/api/v1/financeiro/exportar-contabilidade/',
            {'data_inicio': '2026-06-01', 'data_fim': '2026-05-01'},
        )
        self.assertEqual(res.status_code, 400)
