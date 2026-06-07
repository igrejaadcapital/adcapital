"""Geração e anexo do Termo LGPD (PDF) para membros."""
from django.core.files.base import ContentFile

from membros.utils import enviar_email_resend_api, gerar_termo_lgpd_pdf


def provisionar_termo_lgpd(membro, *, enviar_email=False):
    """
    Gera o PDF do termo LGPD e salva em membro.lgpd_documento se ainda não existir.
    Não altera lgpd_consentido (termo gerado ≠ termo assinado pelo titular).
    Retorna True se gerou, False se já havia documento.
    """
    if membro.lgpd_documento:
        return False

    nome_arquivo, pdf_file = gerar_termo_lgpd_pdf(membro)
    pdf_bytes = pdf_file.read()
    membro.lgpd_documento.save(nome_arquivo, ContentFile(pdf_bytes), save=True)

    if enviar_email and membro.email:
        enviar_email_resend_api(
            to=membro.email,
            subject='Bem-vindo! Seu Termo de Ciência e Aceite (LGPD)',
            body=(
                f'Olá {membro.nome},\n\n'
                'É com alegria que confirmamos o seu cadastro no portal da '
                'Igreja Assembleia de Deus Ministério na Capital.\n\n'
                'Enviamos em anexo o Termo de Consentimento de Dados Pessoais (LGPD). '
                'Pedimos a gentileza de assinar e nos enviar uma foto legível ou cópia digitalizada.'
            ),
            filename=nome_arquivo,
            file_content=pdf_bytes,
        )

    return True
