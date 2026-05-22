from django.test import TestCase
from rest_framework.test import APIClient


class ApiV1RoutesTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_v1_ping_matches_legacy(self):
        legacy = self.client.get('/api/ping/')
        v1 = self.client.get('/api/v1/ping/')
        self.assertEqual(legacy.status_code, 200)
        self.assertEqual(v1.status_code, 200)
        self.assertEqual(legacy.json(), v1.json())

    def test_v1_health_matches_legacy(self):
        legacy = self.client.get('/api/health/')
        v1 = self.client.get('/api/v1/health/')
        self.assertEqual(legacy.status_code, v1.status_code)
        self.assertEqual(legacy.json(), v1.json())

    def test_v1_init_publico(self):
        response = self.client.get('/api/v1/init-publico/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('portal', response.json())

    def test_debug_migrate_still_404_on_both_prefixes(self):
        for path in ('/api/debug/migrate/', '/api/v1/debug/migrate/'):
            self.assertEqual(self.client.get(path).status_code, 404)
