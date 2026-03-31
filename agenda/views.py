from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Evento
from .serializers import EventoSerializer
from .services import get_calendar_service

class EventoViewSet(viewsets.ModelViewSet):
    """
    CRUD para Eventos.
    A criação e exclusão no banco sincronizará automaticamente 
    com o Google Calendar graças aos métodos save() e delete() do modelo.
    """
    queryset = Evento.objects.all().order_by('data_inicio')
    serializer_class = EventoSerializer

class StatusSincronizacaoView(APIView):
    """
    Retorna o status da conexão com a API do Google Calendar.
    """
    def get(self, request):
        service = get_calendar_service()
        if service:
            return Response({"status": "online", "message": "Conectado com sucesso ao Google Calendar."})
        return Response({"status": "offline", "message": "Credenciais não encontradas ou inválidas."})
