import os
import json
import base64
import requests

from membros.utils_termo_lgpd import gerar_termo_lgpd_pdf, gerar_termo_lgpd_pdf_em_branco

__all__ = ['gerar_termo_lgpd_pdf', 'gerar_termo_lgpd_pdf_em_branco', 'enviar_email_resend_api']


def enviar_email_resend_api(to, subject, body, filename=None, file_content=None):
    """
    Envia um e-mail usando a API do Resend via HTTPS (Bypassa o bloqueio de SMTP do Render Free).
    """
    api_key = os.environ.get('RESEND_API_KEY', '').strip()
    if not api_key:
        print("--- [RESEND] ERRO: RESEND_API_KEY não configurada no ambiente.")
        return False
    
    # Log para depuração (ofuscado por segurança)
    print(f"--- [RESEND] Verificando chave (Tamanho: {len(api_key)}, Início: {api_key[:12]}... Fim: {api_key[-4:]})")

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Conversão de quebras de linha para HTML
    html_body = f"<p style='font-family: sans-serif;'>{body.replace('\n', '<br>')}</p>"

    payload = {
        "from": "AD Capital <noreply@adcapitaligreja.com.br>",
        "reply_to": "igrejaadcapital@gmail.com",
        "to": [to],
        "subject": subject,
        "html": html_body,
    }

    if filename and file_content:
        # Resend espera conteúdo em Base64 para anexos
        encoded_content = base64.b64encode(file_content).decode("utf-8")
        payload["attachments"] = [
            {
                "content": encoded_content,
                "filename": filename,
            }
        ]

    try:
        print(f"--- [RESEND] Enviando requisição para {to}...")
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        result = response.json()
        
        if response.status_code in [200, 201]:
            print(f"--- [RESEND] E-mail enviado com sucesso! ID: {result.get('id')}")
            return True
        else:
            print(f"--- [RESEND] ERRO da API: {result}")
            return False
    except Exception as e:
        print(f"--- [RESEND] ERRO de conexão: {e}")
        return False
