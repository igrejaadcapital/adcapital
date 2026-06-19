# -*- coding: utf-8 -*-
from datetime import datetime, timezone

from django.test import SimpleTestCase

from membros.services.infra_alerts_service import (
    ResultadoCheck,
    _dias_restantes,
    _parse_ssl_date,
    checar_vencimentos_manuais,
    formatar_relatorio_texto,
    RelatorioInfra,
)


class InfraAlertsTests(SimpleTestCase):
    def test_parse_ssl_date(self):
        dt = _parse_ssl_date('Aug 15 12:00:00 2026 GMT')
        self.assertEqual(dt.year, 2026)
        self.assertEqual(dt.month, 8)

    def test_formatar_relatorio(self):
        rel = RelatorioInfra(
            gerado_em=datetime(2026, 6, 1, tzinfo=timezone.utc),
            resultados=[
                ResultadoCheck('API ping', 'OK', 'status 200'),
                ResultadoCheck('SSL api', 'AVISO', '20 dias'),
            ],
        )
        texto = formatar_relatorio_texto(rel)
        self.assertIn('AVISO', texto)
        self.assertIn('API ping', texto)

    def test_vencimento_manual_vencido(self):
        import os
        os.environ['ALERTAS_VENCIMENTOS'] = (
            '[{"servico": "Teste", "vencimento": "2020-01-01", "dias_aviso": 30}]'
        )
        try:
            results = checar_vencimentos_manuais(30)
            self.assertTrue(any(r.nivel == 'CRITICO' for r in results))
        finally:
            os.environ.pop('ALERTAS_VENCIMENTOS', None)
