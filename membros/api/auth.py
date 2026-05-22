"""Autenticação JWT e health checks."""
from django.db import close_old_connections, connection
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from membros.services.keep_alive import garantir_keep_alive
from membros.throttles import LoginRateThrottle


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.perfil.role if hasattr(user, 'perfil') else 'MEMBRO'
        token['nome'] = user.get_full_name() or user.username
        return token

    def validate(self, attrs):
        username = attrs.get('username', '')
        if username and any(char in username for char in '.-'):
            attrs['username'] = ''.join(filter(str.isdigit, username))
        data = super().validate(attrs)
        data['role'] = self.user.perfil.role if hasattr(self.user, 'perfil') else 'MEMBRO'
        data['nome'] = self.user.get_full_name() or self.user.username
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]


@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def ping_view(request):
    garantir_keep_alive()
    return Response({'status': 'ok', 'message': 'Servidor acordado!'}, status=200)


@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def health_check(request):
    try:
        close_old_connections()
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
        return Response({'status': 'healthy', 'database': 'ok'}, status=200)
    except Exception as e:
        return Response({'status': 'unhealthy', 'error': str(e)}, status=503)
