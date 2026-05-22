"""Tarefas agendadas (cron-job.org)."""
import datetime
import re

from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response

from membros.models import Membro, Perfil
from membros.permissions import HasCronSecret, IsAdmin
from membros.utils import enviar_email_resend_api


@api_view(['GET'])
@permission_classes([HasCronSecret])
@authentication_classes([])
def verificar_aniversarios(request):
    try:
        hoje = datetime.date.today()
        membros = Membro.objects.filter(
            data_nascimento__month=hoje.month,
            data_nascimento__day=hoje.day,
        ).exclude(ano_ultimo_email_aniversario=hoje.year).exclude(
            email__isnull=True
        ).exclude(email__exact='')

        enviados = 0
        for m in membros:
            html = f"""
            <html><body>
                <h2 style="color: #2563eb;">Feliz Aniversário, {m.nome}! 🎉</h2>
                <p>Nós da <strong>Igreja AD Capital</strong> celebramos sua vida neste dia especial.</p>
                <p><em>"O Senhor te abençoe e te guarde..." (Números 6:24-26)</em></p>
            </body></html>
            """
            enviar_email_resend_api(
                para=[m.email],
                assunto=f'Feliz Aniversário, {m.nome}! 🎉',
                html_conteudo=html,
            )
            m.ano_ultimo_email_aniversario = hoje.year
            m.save()
            enviados += 1
        return Response({'success': True, 'enviados': enviados})
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAdmin])
def resetar_senhas_em_massa(request):
    atualizados = 0
    for m in Membro.objects.all():
        if not m.cpf:
            continue
        cpf_limpo = ''.join(re.findall(r'\d+', m.cpf))
        if not cpf_limpo or len(cpf_limpo) < 5:
            continue
        user = User.objects.filter(username=cpf_limpo).first()
        if not user:
            p = Perfil.objects.filter(membro=m).first()
            if p:
                user = p.user
        if user:
            user.set_password(f'Adcapital{cpf_limpo[:5]}')
            user.save()
            atualizados += 1
    return Response({'success': True, 'atualizados': atualizados, 'erros': []})
