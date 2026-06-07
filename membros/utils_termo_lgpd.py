import io
from textwrap import wrap

from django.core.files.base import ContentFile
from django.utils import timezone
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

CONTROLADORA = (
    'Controladora: Igreja Evangélica Assembleia de Deus na Capital (AD Capital), '
    'pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 45.595.281/0001-00, '
    'com sede na Ch 18 Lt 6/7, Setor de Mansões IAPI, Guará 2, Brasília/DF, CEP 71.081-245.'
)

PARAGRAFOS_TERMO_LGPD = [
    {
        'text': (
            'Pelo presente instrumento, eu, abaixo qualificado(a), na qualidade de Titular dos Dados, '
            'manifesto meu consentimento livre, informado e inequívoco para que a Controladora realize '
            'o tratamento de meus dados pessoais, incluindo dados sensíveis, nos termos da Lei nº '
            '13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD) e das seguintes condições:'
        ),
        'bold': False,
    },
    {'text': '', 'bold': False},
    {'text': '1. DADOS PESSOAIS COLETADOS', 'bold': True},
    {
        'text': (
            'A Controladora poderá coletar os seguintes dados: nome completo, CPF, RG, data de nascimento, '
            'endereço, telefone, e-mail, estado civil e, dado o contexto religioso, a sua convicção '
            'religiosa, este último classificado como dado pessoal sensível (Art. 5º, II, da LGPD).'
        ),
        'bold': False,
    },
    {'text': '', 'bold': False},
    {'text': '2. FINALIDADE E BASE LEGAL DO TRATAMENTO', 'bold': True},
    {
        'text': (
            'Os dados coletados serão utilizados para as finalidades legítimas e exclusivas da '
            'organização religiosa, incluindo:'
        ),
        'bold': False,
    },
    {'text': 'a) Manutenção do cadastro de membros e registros eclesiásticos;', 'bold': False},
    {'text': 'b) Gestão de ministérios, escalas de voluntariado e atividades internas;', 'bold': False},
    {
        'text': (
            'c) Envio de comunicações institucionais, como informativos de eventos, avisos de cultos '
            'e felicitações;'
        ),
        'bold': False,
    },
    {
        'text': (
            'd) Emissão de documentos eclesiásticos, como certificados de batismo, consagração ou '
            'cartas de recomendação;'
        ),
        'bold': False,
    },
    {'text': 'e) Cumprimento de obrigações legais e estatutárias da instituição.', 'bold': False},
    {'text': '', 'bold': False},
    {
        'text': (
            'O tratamento de dados pessoais ocorre com base no consentimento do Titular (Art. 7º, I, da LGPD) '
            'e, no caso do dado sensível de convicção religiosa, com base no consentimento específico '
            'fornecido neste termo (Art. 11, I, da LGPD).'
        ),
        'bold': False,
    },
    {'text': '', 'bold': False},
    {'text': '3. COMPARTILHAMENTO DE DADOS', 'bold': True},
    {
        'text': (
            'A Controladora compromete-se a não comercializar ou compartilhar seus dados com terceiros sem '
            'o seu consentimento explícito, exceto com operadores de dados estritamente necessários para '
            'as finalidades descritas (ex: sistemas de gestão em nuvem) ou por força de determinação legal '
            'ou judicial. Caso os operadores de tecnologia estejam localizados fora do Brasil, o Titular '
            'concorda com essa transferência internacional de dados.'
        ),
        'bold': False,
    },
    {'text': '', 'bold': False},
    {'text': '4. PERÍODO DE RETENÇÃO DOS DADOS', 'bold': True},
    {
        'text': (
            'Os dados pessoais serão mantidos pela Controladora enquanto perdurar o vínculo de membresia '
            'do Titular com a instituição. Após o término do vínculo, os dados poderão ser conservados '
            'pelo prazo necessário ao cumprimento de obrigações legais ou para o exercício regular de '
            'direitos em processo judicial, administrativo ou arbitral.'
        ),
        'bold': False,
    },
    {'text': '', 'bold': False},
    {'text': '5. DIREITOS DO TITULAR', 'bold': True},
    {
        'text': (
            'O Titular poderá, a qualquer momento e mediante requisição formal, exercer seus direitos '
            'previstos na LGPD, como:'
        ),
        'bold': False,
    },
    {'text': 'a) Confirmação da existência de tratamento;', 'bold': False},
    {'text': 'b) Acesso aos dados;', 'bold': False},
    {'text': 'c) Correção de dados incompletos, inexatos ou desatualizados;', 'bold': False},
    {'text': 'd) Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;', 'bold': False},
    {'text': 'e) Portabilidade dos dados a outro fornecedor de serviço ou produto;', 'bold': False},
    {'text': 'f) Eliminação dos dados tratados com o seu consentimento;', 'bold': False},
    {'text': 'g) Revogação deste consentimento.', 'bold': False},
    {'text': '', 'bold': False},
    {
        'text': (
            'Para exercer seus direitos, entre em contato com nosso Encarregado pela Proteção de Dados '
            '(DPO) através do e-mail: igrejaadcapital@gmail.com.'
        ),
        'bold': False,
    },
    {'text': '', 'bold': False},
    {'text': '6. MEDIDAS DE SEGURANÇA', 'bold': True},
    {
        'text': (
            'A Controladora declara adotar medidas de segurança, técnicas e administrativas, para proteger '
            'os dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição, '
            'perda, alteração ou difusão.'
        ),
        'bold': False,
    },
    {'text': '', 'bold': False},
    {'text': '________________________________________________________________________________', 'bold': False},
    {'text': '', 'bold': False},
    {'text': 'AUTORIZAÇÃO ESPECÍFICA PARA USO DE IMAGEM E SOM', 'bold': True},
    {
        'text': (
            'De forma separada e específica, o Titular pode autorizar o uso de sua imagem e voz. '
            'Esta autorização é opcional e não condiciona sua afiliação como membro.'
        ),
        'bold': False,
    },
    {'text': '', 'bold': False},
    {
        'text': (
            '(   ) AUTORIZO, de forma gratuita, o uso de minha imagem e/ou voz, captadas durante cultos, '
            'eventos e atividades da AD Capital, para fins de divulgação institucional em mídias sociais, '
            'transmissões online (ao vivo ou gravadas), site oficial e materiais de comunicação da igreja, '
            'por tempo indeterminado.'
        ),
        'bold': False,
    },
    {
        'text': (
            '(   ) NÃO AUTORIZO o uso de minha imagem e/ou voz para as finalidades descritas acima.'
        ),
        'bold': False,
    },
    {'text': '', 'bold': False},
    {'text': '________________________________________________________________________________', 'bold': False},
    {'text': '', 'bold': False},
    {
        'text': (
            'Ao assinar este termo, declaro que li, compreendi e concordo com todas as disposições '
            'aqui apresentadas.'
        ),
        'bold': True,
    },
]


def _renderizar_pdf_termo_lgpd(*, membro=None):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    largura_pagina, altura_pagina = A4
    margem_esq = 50
    y = altura_pagina - 50

    def check_page(y_pos, needed=14):
        if y_pos < 80:
            c.showPage()
            c.setFont('Helvetica', 9)
            return altura_pagina - 50
        return y_pos

    c.setFont('Helvetica-Bold', 12)
    c.drawCentredString(
        largura_pagina / 2.0,
        y,
        'TERMO DE CONSENTIMENTO PARA TRATAMENTO DE DADOS PESSOAIS (LGPD)',
    )
    y -= 25

    c.setFont('Helvetica-Bold', 9)
    for linha in wrap(CONTROLADORA, width=110):
        c.drawString(margem_esq, y, linha)
        y -= 12
    y -= 10

    for p in PARAGRAFOS_TERMO_LGPD:
        if p['text'] == '':
            y -= 5
            continue
        c.setFont('Helvetica-Bold' if p['bold'] else 'Helvetica', 9)
        for linha in wrap(p['text'], width=110):
            y = check_page(y)
            c.drawString(margem_esq, y, linha)
            y -= 12

    y -= 20
    y = check_page(y, 80)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(margem_esq, y, 'DADOS DO TITULAR:')
    y -= 18
    c.setFont('Helvetica', 10)

    if membro:
        c.drawString(margem_esq, y, f'Nome Completo: {membro.nome.upper()}')
        y -= 15
        c.drawString(margem_esq, y, f'CPF: {membro.cpf}')
        y -= 30
        cidade_uf = f'{membro.cidade} - {membro.uf}' if membro.cidade and membro.uf else 'Brasília - DF'
        c.drawString(margem_esq, y, f'{cidade_uf}, {timezone.now().strftime("%d/%m/%Y")}.')
    else:
        c.drawString(margem_esq, y, 'Nome Completo: _________________________________________________________________')
        y -= 18
        c.drawString(margem_esq, y, 'CPF: _________________________________________________________________')
        y -= 18
        c.drawString(margem_esq, y, 'RG: _________________________________________________________________')
        y -= 18
        c.drawString(margem_esq, y, 'Telefone: ___________________________   E-mail: ___________________________')
        y -= 30
        c.drawString(
            margem_esq,
            y,
            'Local: _______________________________________,  _____ / _____ / __________',
        )

    y -= 40
    y = check_page(y, 30)
    c.drawString(margem_esq, y, '______________________________________________________________________')
    y -= 15
    c.setFont('Helvetica', 9)
    c.drawCentredString(largura_pagina / 2.0, y, 'Assinatura do(a) Titular')

    c.save()
    buffer.seek(0)
    return buffer.read()


def gerar_termo_lgpd_pdf(membro):
    """Gera PDF do termo LGPD preenchido com dados do membro."""
    pdf_bytes = _renderizar_pdf_termo_lgpd(membro=membro)
    nome_arquivo = f'termo_lgpd_{membro.cpf}.pdf'
    return nome_arquivo, ContentFile(pdf_bytes)


def gerar_termo_lgpd_pdf_em_branco():
    """Gera PDF em branco para impressão e coleta de assinaturas físicas."""
    pdf_bytes = _renderizar_pdf_termo_lgpd(membro=None)
    return 'termo_lgpd_em_branco.pdf', ContentFile(pdf_bytes)
