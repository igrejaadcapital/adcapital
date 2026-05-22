from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from membros.permissions import IsAdmin, IsStaffChurch
from .models import Evento, ProgramacaoSemanal
from .serializers import EventoSerializer, ProgramacaoSemanalSerializer
from .services import get_calendar_service, importar_eventos_do_google

class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all().order_by('data_inicio')
    serializer_class = EventoSerializer
    permission_classes = [IsStaffChurch]

class ProgramacaoSemanalViewSet(viewsets.ModelViewSet):
    """
    ViewSet para a programação semanal (EBD, Cultos fixos).
    Público para leitura (list), restrito para edição.
    """
    queryset = ProgramacaoSemanal.objects.all().order_by('dia_semana', 'ordem')
    serializer_class = ProgramacaoSemanalSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class SyncGoogleEventsView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        resultado = importar_eventos_do_google()
        if "error" in resultado:
            return Response(resultado, status=500)
        return Response(resultado)

class StatusSincronizacaoView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        service = get_calendar_service()
        if service:
            return Response({"status": "online", "message": "Conectado com sucesso ao Google Calendar."})
        return Response({"status": "offline", "message": "Credenciais não encontradas ou inválidas."})
