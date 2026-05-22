from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from agenda.models import Evento
from membros.models import Perfil

User = get_user_model()


class EventoPermissionsTests(APITestCase):
    def setUp(self):
        inicio = timezone.now() + timedelta(days=7)
        fim = inicio + timedelta(hours=2)
        self.evento = Evento.objects.create(
            titulo='Culto de Domingo',
            descricao='Teste',
            data_inicio=inicio,
            data_fim=fim,
        )
        self.membro_user, _ = User.objects.get_or_create(
            username='99988877766',
            defaults={'password': 'test-pass-123'},
        )
        Perfil.objects.get_or_create(user=self.membro_user, defaults={'role': 'MEMBRO'})

    def _auth(self, user):
        token = str(AccessToken.for_user(user))
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_membro_pode_listar_eventos(self):
        self._auth(self.membro_user)
        response = self.client.get('/api/v1/agenda/eventos/')
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.json()), 1)

    def test_membro_nao_pode_criar_evento(self):
        self._auth(self.membro_user)
        inicio = (timezone.now() + timedelta(days=14)).isoformat()
        fim = (timezone.now() + timedelta(days=14, hours=2)).isoformat()
        response = self.client.post(
            '/api/v1/agenda/eventos/',
            {
                'titulo': 'Novo',
                'data_inicio': inicio,
                'data_fim': fim,
            },
            format='json',
        )
        self.assertEqual(response.status_code, 403)
