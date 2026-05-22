from django.test import TestCase


class OpenApiSchemaTests(TestCase):
    def test_v1_schema_returns_openapi_document(self):
        response = self.client.get('/api/v1/schema/')
        self.assertEqual(response.status_code, 200)
        body = response.content.decode()
        self.assertIn('openapi', body.lower())

    def test_v1_docs_ui_loads(self):
        response = self.client.get('/api/v1/docs/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('swagger', response.content.decode().lower())

    def test_legacy_api_has_no_schema_route(self):
        response = self.client.get('/api/schema/')
        self.assertEqual(response.status_code, 404)
