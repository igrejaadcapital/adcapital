"""Tarefas pesadas após auto-cadastro (PDF LGPD, e-mail, parentesco)."""
import traceback

from django.core.files.base import ContentFile
from django.db import connection, close_old_connections

from membros.models import Membro
from membros.utils import enviar_email_resend_api, gerar_termo_lgpd_pdf
from membros.services.parentesco_service import salvar_parentescos


def executar_tarefas_pos_cadastro(membro_id, parentescos_data):
    try:
        close_old_connections()
        membro = Membro.objects.get(id=membro_id)
        membro_nome = membro.nome
        membro_email = membro.email
        connection.close()

        nome_arquivo, pdf_file = gerar_termo_lgpd_pdf(membro)
        pdf_bytes = pdf_file.read()

        if membro_email:
            enviar_email_resend_api(
                to=membro_email,
                subject='Bem-vindo! Seu Termo de Ciência e Aceite (LGPD)',
                body=(
                    f'Olá {membro_nome},\n\n'
                    'É com alegria que confirmamos o seu cadastro no portal da '
                    'Igreja Assembleia de Deus Ministério na Capital.\n\n'
                    'Enviamos em anexo o Termo de Consentimento de Dados Pessoais (LGPD).'
                ),
                filename=nome_arquivo,
                file_content=pdf_bytes,
            )

        close_old_connections()
        membro = Membro.objects.get(id=membro_id)
        membro.lgpd_documento.save(nome_arquivo, ContentFile(pdf_bytes), save=True)

        if parentescos_data:
            salvar_parentescos(membro, parentescos_data)
    except Exception:
        print('--- [BG-THREAD] ERRO CRÍTICO EM TAREFAS DE BACKGROUND ---')
        traceback.print_exc()
    finally:
        try:
            connection.close()
        except Exception:
            pass
