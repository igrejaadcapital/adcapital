from datetime import datetime
from zoneinfo import ZoneInfo

from django.test import SimpleTestCase

from membros.services.keep_alive import em_horario_quieto, keep_alive_config


class KeepAliveConfigTests(SimpleTestCase):
    def test_defaults(self):
        cfg = keep_alive_config()
        self.assertTrue(cfg['enabled'])
        self.assertEqual(cfg['interval_seconds'], 240)
        self.assertEqual(cfg['quiet_start'], 23)
        self.assertEqual(cfg['quiet_end'], 6)
        self.assertEqual(cfg['timezone'], 'America/Sao_Paulo')


class KeepAliveQuietHoursTests(SimpleTestCase):
    tz = ZoneInfo('America/Sao_Paulo')

    def _at(self, hour: int, minute: int = 0) -> datetime:
        return datetime(2026, 6, 19, hour, minute, tzinfo=self.tz)

    def test_active_during_day(self):
        self.assertFalse(em_horario_quieto(self._at(6), quiet_start=23, quiet_end=6))
        self.assertFalse(em_horario_quieto(self._at(12), quiet_start=23, quiet_end=6))
        self.assertFalse(em_horario_quieto(self._at(22, 59), quiet_start=23, quiet_end=6))

    def test_quiet_overnight(self):
        self.assertTrue(em_horario_quieto(self._at(23), quiet_start=23, quiet_end=6))
        self.assertTrue(em_horario_quieto(self._at(2), quiet_start=23, quiet_end=6))
        self.assertTrue(em_horario_quieto(self._at(5, 59), quiet_start=23, quiet_end=6))

    def test_same_day_window(self):
        self.assertFalse(em_horario_quieto(self._at(9), quiet_start=12, quiet_end=14))
        self.assertTrue(em_horario_quieto(self._at(13), quiet_start=12, quiet_end=14))

    def test_disabled_when_start_equals_end(self):
        self.assertFalse(em_horario_quieto(self._at(3), quiet_start=6, quiet_end=6))
