"""Gestão de usuários e senhas."""
import threading

from django.contrib.auth.models import User
from django.db import close_old_connections, connection
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from membros.permissions import IsAdmin
from membros.throttles import ResetSenhaRateThrottle
from membros.utils import enviar_email_resend_api


class UsuariosView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        data = []
        for u in User.objects.all().select_related('perfil__membro').order_by('username'):
            nome = u.get_full_name()
            if not nome and hasattr(u, 'perfil') and u.perfil.membro:
                nome = u.perfil.membro.nome
            data.append({
                'id': u.id,
                'username': u.username,
                'nome': nome or u.username,
                'role': u.perfil.role if hasattr(u, 'perfil') else 'MEMBRO',
                'is_active': u.is_active,
            })
        data.sort(key=lambda x: x['nome'])
        return Response(data)

    def patch(self, request, pk):
        try:
            u = User.objects.get(pk=pk)
            role = request.data.get('role')
            if role in ['ADMIN', 'SECRETARIO', 'TESOUREIRO', 'MEMBRO']:
                u.perfil.role = role
                u.perfil.save()
                return Response({'success': True})
            return Response({'error': 'Papel inválido'}, status=400)
        except User.DoesNotExist:
            return Response({'error': 'Usuário não encontrado'}, status=404)


class TrocarSenhaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        nova_senha = request.data.get('nova_senha')
        if not nova_senha or len(nova_senha) < 4:
            return Response({'error': 'Senha deve ter pelo menos 4 caracteres'}, status=400)
        request.user.set_password(nova_senha)
        request.user.save()
        return Response({'success': 'Senha alterada com sucesso!'})


class ResetarSenhaView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ResetSenhaRateThrottle]

    def post(self, request):
        cpf = request.data.get('cpf')
        if not cpf:
            return Response({'error': 'CPF é obrigatório'}, status=400)
        cpf_limpo = ''.join(filter(str.isdigit, cpf))
        user = User.objects.filter(username=cpf_limpo).first()
        if not user:
            return Response({'error': 'Usuário não encontrado com este CPF'}, status=404)
        if len(cpf_limpo) < 5:
            return Response({'error': 'CPF inválido'}, status=400)

        nova_senha = f'Adcapital{cpf_limpo[:5]}'
        user.set_password(nova_senha)
        user.save()

        email_destino = user.email
        if not email_destino and hasattr(user, 'perfil') and user.perfil.membro:
            email_destino = user.perfil.membro.email

        if email_destino:
            def enviar_bg():
                try:
                    close_old_connections()
                    connection.close()
                    enviar_email_resend_api(
                        to=email_destino,
                        subject='Senha Resetada - Portal AD Capital',
                        body=(
                            'Olá,\n\nSua senha de acesso ao Portal AD Capital foi resetada.\n\n'
                            f'Sua NOVA SENHA: {nova_senha}\n\n'
                            'Acesse: https://adcapitaligreja.com.br/#/portal\n'
                        ),
                    )
                except Exception as e:
                    print(f'Erro ao enviar email de reset: {e}')
                finally:
                    try:
                        connection.close()
                    except Exception:
                        pass

            threading.Thread(target=enviar_bg, daemon=True).start()
            return Response({
                'success': f'Senha resetada! Instruções enviadas para {email_destino}',
            })
        return Response({
            'success': 'Senha resetada. (E-mail não cadastrado para envio automático)',
        })
