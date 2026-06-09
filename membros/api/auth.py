"""Autenticação JWT e health checks."""
from django.db import close_old_connections, connection
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from membros.api.jwt_cookies import REFRESH_COOKIE, clear_jwt_cookies, set_jwt_cookies
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

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            set_jwt_cookies(response, response.data['access'], response.data['refresh'])
        return response


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh = request.data.get('refresh') or request.COOKIES.get(REFRESH_COOKIE)
        serializer = self.get_serializer(data={'refresh': refresh})
        serializer.is_valid(raise_exception=True)
        response = Response(serializer.validated_data, status=200)
        set_jwt_cookies(response, serializer.validated_data['access'], refresh)
        return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_me(request):
    user = request.user
    role = user.perfil.role if hasattr(user, 'perfil') else 'MEMBRO'
    return Response({
        'username': user.username,
        'role': role,
        'nome': user.get_full_name() or user.username,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def auth_logout(request):
    response = Response({'ok': True})
    clear_jwt_cookies(response)
    return response


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
