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
    margem_esq = 50
    margem_dir = largura_pagina - 50
    y = altura_pagina - 50

    def check_page(y_pos, needed=14):
        if y_pos < 80:
            c.showPage()
            c.setFont("Helvetica", 9)
            return altura_pagina - 50
        return y_pos

    # Título
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(largura_pagina / 2.0, y, "TERMO DE CONSENTIMENTO PARA TRATAMENTO DE DADOS PESSOAIS (LGPD)")
    y -= 25

    # Controladora
    c.setFont("Helvetica-Bold", 9)
    controladora = "Controladora: Igreja Evangélica Assembleia de Deus na Capital (AD Capital), pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 45.595.281/0001-00, com sede na Ch 18 Lt 6/7, Setor de Mansões IAPI, Guará 2, Brasília/DF, CEP 71.081-245."
    for linha in wrap(controladora, width=110):
        c.drawString(margem_esq, y, linha)
        y -= 12
    y -= 10

    # Texto do Termo
    paragrafos_termo = [
        {"text": "Pelo presente instrumento, eu, abaixo qualificado(a), na qualidade de Titular dos Dados, manifesto meu consentimento livre, informado e inequívoco para que a Controladora realize o tratamento de meus dados pessoais, incluindo dados sensíveis, nos termos da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD) e das seguintes condições:", "bold": False},
        {"text": "", "bold": False},
        {"text": "1. DADOS PESSOAIS COLETADOS", "bold": True},
        {"text": "A Controladora poderá coletar os seguintes dados: nome completo, CPF, RG, data de nascimento, endereço, telefone, e-mail, estado civil e, dado o contexto religioso, a sua convicção religiosa, este último classificado como dado pessoal sensível (Art. 5º, II, da LGPD).", "bold": False},
        {"text": "", "bold": False},
        {"text": "2. FINALIDADE E BASE LEGAL DO TRATAMENTO", "bold": True},
        {"text": "Os dados coletados serão utilizados para as finalidades legítimas e exclusivas da organização religiosa, incluindo:", "bold": False},
        {"text": "a) Manutenção do cadastro de membros e registros eclesiásticos;", "bold": False},
        {"text": "b) Gestão de ministérios, escalas de voluntariado e atividades internas;", "bold": False},
        {"text": "c) Envio de comunicações institucionais, como informativos de eventos, avisos de cultos e felicitações;", "bold": False},
        {"text": "d) Emissão de documentos eclesiásticos, como certificados de batismo, consagração ou cartas de recomendação;", "bold": False},
        {"text": "e) Cumprimento de obrigações legais e estatutárias da instituição.", "bold": False},
        {"text": "", "bold": False},
        {"text": "O tratamento de dados pessoais ocorre com base no consentimento do Titular (Art. 7º, I, da LGPD) e, no caso do dado sensível de convicção religiosa, com base no consentimento específico fornecido neste termo (Art. 11, I, da LGPD).", "bold": False},
        {"text": "", "bold": False},
        {"text": "3. COMPARTILHAMENTO DE DADOS", "bold": True},
        {"text": "A Controladora compromete-se a não comercializar ou compartilhar seus dados com terceiros sem o seu consentimento explícito, exceto com operadores de dados estritamente necessários para as finalidades descritas (ex: sistemas de gestão em nuvem) ou por força de determinação legal ou judicial. Caso os operadores de tecnologia estejam localizados fora do Brasil, o Titular concorda com essa transferência internacional de dados.", "bold": False},
        {"text": "", "bold": False},
        {"text": "4. PERÍODO DE RETENÇÃO DOS DADOS", "bold": True},
        {"text": "Os dados pessoais serão mantidos pela Controladora enquanto perdurar o vínculo de membresia do Titular com a instituição. Após o término do vínculo, os dados poderão ser conservados pelo prazo necessário ao cumprimento de obrigações legais ou para o exercício regular de direitos em processo judicial, administrativo ou arbitral.", "bold": False},
        {"text": "", "bold": False},
        {"text": "5. DIREITOS DO TITULAR", "bold": True},
        {"text": "O Titular poderá, a qualquer momento e mediante requisição formal, exercer seus direitos previstos na LGPD, como:", "bold": False},
        {"text": "a) Confirmação da existência de tratamento;", "bold": False},
        {"text": "b) Acesso aos dados;", "bold": False},
        {"text": "c) Correção de dados incompletos, inexatos ou desatualizados;", "bold": False},
        {"text": "d) Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;", "bold": False},
        {"text": "e) Portabilidade dos dados a outro fornecedor de serviço ou produto;", "bold": False},
        {"text": "f) Eliminação dos dados tratados com o seu consentimento;", "bold": False},
        {"text": "g) Revogação deste consentimento.", "bold": False},
        {"text": "", "bold": False},
        {"text": "Para exercer seus direitos, entre em contato com nosso Encarregado pela Proteção de Dados (DPO) através do e-mail: igrejaadcapital@gmail.com.", "bold": False},
        {"text": "", "bold": False},
        {"text": "6. MEDIDAS DE SEGURANÇA", "bold": True},
        {"text": "A Controladora declara adotar medidas de segurança, técnicas e administrativas, para proteger os dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição, perda, alteração ou difusão.", "bold": False},
        {"text": "", "bold": False},
        {"text": "________________________________________________________________________________", "bold": False},
        {"text": "", "bold": False},
        {"text": "AUTORIZAÇÃO ESPECÍFICA PARA USO DE IMAGEM E SOM", "bold": True},
        {"text": "De forma separada e específica, o Titular pode autorizar o uso de sua imagem e voz. Esta autorização é opcional e não condiciona sua afiliação como membro.", "bold": False},
        {"text": "", "bold": False},
        {"text": "( X ) AUTORIZO, de forma gratuita, o uso de minha imagem e/ou voz, captadas durante cultos, eventos e atividades da AD Capital, para fins de divulgação institucional em mídias sociais, transmissões online (ao vivo ou gravadas), site oficial e materiais de comunicação da igreja, por tempo indeterminado.", "bold": False},
        {"text": "", "bold": False},
        {"text": "________________________________________________________________________________", "bold": False},
        {"text": "", "bold": False},
        {"text": "Ao assinar este termo, declaro que li, compreendi e concordo com todas as disposições aqui apresentadas.", "bold": True},
    ]

    for p in paragrafos_termo:
        if p["text"] == "":
            y -= 5
            continue

        if p["bold"]:
            c.setFont("Helvetica-Bold", 9)
        else:
            c.setFont("Helvetica", 9)

        linhas = wrap(p["text"], width=110)
        for linha in linhas:
            y = check_page(y)
            c.drawString(margem_esq, y, linha)
            y -= 12

    y -= 20
    y = check_page(y, 80)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margem_esq, y, "DADOS DO TITULAR:")
    y -= 18
    c.setFont("Helvetica", 10)
    c.drawString(margem_esq, y, f"Nome Completo: {membro.nome.upper()}")
    y -= 15
    c.drawString(margem_esq, y, f"CPF: {membro.cpf}")

    y -= 30
    cidade_uf = f"{membro.cidade} - {membro.uf}" if membro.cidade and membro.uf else "Brasília - DF"
    c.drawString(margem_esq, y, f"{cidade_uf}, {timezone.now().strftime('%d/%m/%Y')}.")

    y -= 40
    y = check_page(y, 30)
    c.drawString(margem_esq, y, "______________________________________________________________________")
    y -= 15
    c.setFont("Helvetica", 9)
    c.drawCentredString(largura_pagina / 2.0, y, "Assinatura do(a) Titular")

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
