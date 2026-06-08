"""Tarefas de auto-cadastro público (LGPD, e-mail, parentesco)."""
import logging
import traceback

from django.db import connection, close_old_connections

from membros.models import Membro
from membros.services.parentesco_service import salvar_parentescos
from membros.services.acesso_service import garantir_acesso_membro, senha_padrao
from membros.services.lgpd_service import provisionar_termo_lgpd
from membros.utils import enviar_email_resend_api

logger = logging.getLogger(__name__)


def finalizar_cadastro_publico(membro, parentescos_data, *, enviar_email: bool = True):
    """
    Provisiona acesso, termo LGPD e parentescos de forma síncrona (resposta da API).
    Retorna URL do termo LGPD, se gerado.
    """
    garantir_acesso_membro(membro)
    provisionar_termo_lgpd(membro, enviar_email=False)
    if parentescos_data:
        salvar_parentescos(membro, parentescos_data)

    lgpd_url = membro.lgpd_documento.url if membro.lgpd_documento else None

    if enviar_email and membro.email and membro.lgpd_documento:
        _agendar_email_boas_vindas(membro.id)

    return lgpd_url


def _agendar_email_boas_vindas(membro_id):
    import threading
    threading.Thread(target=_enviar_email_boas_vindas, args=(membro_id,), daemon=True).start()


def _enviar_email_boas_vindas(membro_id):
    try:
        close_old_connections()
        membro = Membro.objects.get(id=membro_id)
        cpf = ''.join(filter(str.isdigit, membro.cpf or ''))
        senha_inicial = senha_padrao(cpf) if cpf else ''

        pdf_bytes = None
        nome_arquivo = None
        if membro.lgpd_documento:
            with membro.lgpd_documento.open('rb') as f:
                pdf_bytes = f.read()
            nome_arquivo = membro.lgpd_documento.name.split('/')[-1]

        msg_corpo = (
            f'Olá {membro.nome},\n\n'
            'É com alegria que confirmamos o seu cadastro no portal da Igreja AD Capital.\n\n'
            'SEU ACESSO AO PORTAL DO MEMBRO:\n'
            'Site: https://sistema.adcapitaligreja.com.br/portal/mensagens\n'
            f'Usuário (CPF): {membro.cpf}\n'
            f'Senha Padrão: {senha_inicial}\n'
            '(Recomendamos alterar sua senha após o primeiro acesso)\n\n'
            'TERMO LGPD:\n'
            'Enviamos em anexo o Termo de Consentimento. '
            'Pedimos a gentileza de assinar e devolver uma cópia legível.\n\n'
            'Fraternalmente,\nEquipe AD Capital'
        )

        enviar_email_resend_api(
            to=membro.email,
            subject='Bem-vindo à AD Capital! (Acesso ao Portal)',
            body=msg_corpo,
            filename=nome_arquivo,
            file_content=pdf_bytes,
        )
    except Exception:
        logger.exception('Falha ao enviar e-mail de boas-vindas (membro_id=%s)', membro_id)
    finally:
        try:
            connection.close()
        except Exception:
            pass


def executar_tarefas_pos_cadastro(membro_id, parentescos_data):
    """Compatibilidade: tarefas em background (legado)."""
    try:
        close_old_connections()
        membro = Membro.objects.get(id=membro_id)
        finalizar_cadastro_publico(membro, parentescos_data, enviar_email=True)
    except Exception:
        logger.exception('Erro em tarefas pós-cadastro (membro_id=%s)', membro_id)
    finally:
        try:
            connection.close()
        except Exception:
            pass
