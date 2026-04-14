import io
import os
import json
import base64
import requests
from django.core.files.base import ContentFile
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from django.utils import timezone
from textwrap import wrap

def gerar_termo_lgpd_pdf(membro):
    """
    Gera um PDF do termo da LGPD para o membro e retorna um ContentFile.
    """
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    largura_pagina, altura_pagina = A4
    y = altura_pagina - 50

    # Título
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(largura_pagina / 2.0, y, "TERMO DE CONSENTIMENTO PARA TRATAMENTO DE DADOS PESSOAIS (LGPD)")
    y -= 25

    c.setFont("Helvetica-Bold", 9)
    c.drawString(50, y, "ORGANIZAÇÃO RELIGIOSA: Igreja Evangélica Assembleia de Deus na Capital - AD Capital")
    y -= 15
    c.drawString(50, y, "CNPJ: 45.595.281/0001-00")
    y -= 15
    c.drawString(50, y, "ENDEREÇO: Ch 18 Lt 6/7 Setor de Mansões IAPI - Guará 2 - Brasília - DF - 71.081-245")
    y -= 25

    # Texto do Termo
    paragrafos_termo = [
        "Pelo presente instrumento, eu, abaixo identificado(a), na qualidade de TITULAR DOS DADOS, autorizo expressamente a AD Capital (CONTROLADORA) a realizar o tratamento de meus dados pessoais e dados pessoais sensíveis, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018).",
        "",
        "1. DADOS COLETADOS",
        "Os dados coletados através do formulário de cadastro podem incluir, mas não se limitam a: Nome completo, CPF, RG, data de nascimento, endereço, telefone, e-mail, estado civil, além da convicção religiosa (dado sensível nos termos do Art. 5º, II da LGPD).",
        "",
        "2. FINALIDADES DO TRATAMENTO",
        "A Controladora fica autorizada a utilizar os dados para:",
        "- Manutenção do rol de membros e registros eclesiásticos oficiais;",
        "- Gestão de escalas de ministérios e atividades de voluntariado;",
        "- Comunicação institucional (informativos, eventos, aniversários e avisos de cultos);",
        "- Emissão de certificados de batismo, consagração ou cartas de recomendação;",
        "- Cumprimento de obrigações legais ou estatutárias da instituição.",
        "",
        "3. COMPARTILHAMENTO DE DADOS",
        "A Igreja compromete-se a não comercializar os dados coletados. O compartilhamento ocorrerá apenas com operadores de dados necessários para a operação (ex: sistemas de gestão de membros na nuvem) ou por determinação judicial.",
        "",
        "4. DIREITO DE REVOGAÇÃO E CORREÇÃO",
        "O Titular poderá, a qualquer momento, por meio de solicitação escrita:",
        "- Acessar seus dados;",
        "- Corrigir dados incompletos ou inexatos;",
        "- Revogar este consentimento, ciente de que isso poderá inviabilizar a manutenção do vínculo formal como membro da instituição.",
        "",
        "5. USO DE IMAGEM E SOM",
        "[ X ] AUTORIZO o uso da minha imagem e voz em fotografias e gravações de vídeo realizadas durante as atividades da igreja, para fins de divulgação em redes sociais, transmissões online e materiais institucionais."
    ]

    for p in paragrafos_termo:
        if p == "":
            y -= 5
            continue
        if p.startswith('1. ') or p.startswith('2. ') or p.startswith('3. ') or p.startswith('4. ') or p.startswith('5. '):
            c.setFont("Helvetica-Bold", 9)
        else:
            c.setFont("Helvetica", 9)
            
        linhas = wrap(p, width=110)
        for linha in linhas:
            c.drawString(50, y, linha)
            y -= 12
            if y < 80:
                 c.showPage()
                 c.setFont("Helvetica", 9)
                 y = altura_pagina - 50

    y -= 25
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, y, "DADOS DO TITULAR:")
    y -= 15
    c.setFont("Helvetica", 10)
    c.drawString(50, y, f"Nome: {membro.nome.upper()}")
    y -= 15
    c.drawString(50, y, f"CPF: {membro.cpf}")
    y -= 15
    c.drawString(50, y, f"E-mail: {membro.email or ''}")
    
    y -= 30
    cidade_uf = f"{membro.cidade} - {membro.uf}" if membro.cidade and membro.uf else "Brasília - DF"
    c.drawString(50, y, f"{cidade_uf}, {timezone.now().strftime('%d/%m/%Y')}.")
    
    y -= 30
    c.setFont("Helvetica-Oblique", 9)
    c.drawString(50, y, "(Assinado digitalmente via Gov.br)")

    c.save()
    buffer.seek(0)
    
    nome_arquivo = f"termo_lgpd_{membro.cpf}.pdf"
    return nome_arquivo, ContentFile(buffer.read())

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
        "from": "AD Capital <onboarding@resend.dev>",
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
