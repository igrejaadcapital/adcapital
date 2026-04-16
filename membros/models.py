from django.db import models
from cloudinary_storage.storage import RawMediaCloudinaryStorage

class Funcao(models.Model):
    nome = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nome

class Membro(models.Model):
    # Opções que você já tinha definido (Mantido do adcapitalapp)
    FUNCOES_CHOICES = [
        ('MEMBRO', 'Membro'),
        ('PASTOR', 'Pastor(a)'),
        ('PRESBITERO', 'Presbítero'),
        ('DIACONO', 'Diácono/Diaconisa'),
        ('EVANGELISTA', 'Evangelista'),
        ('MISSIONARIO', 'Missionário(a)'),
        ('COOPERADOR', 'Cooperador(a)'),
    ]

    GENERO_CHOICES = [('M', 'Varão'), ('F', 'Varoa')]
    STATUS_CHOICES = [('LIGADO', 'Ligado'), ('DESLIGADO', 'Desligado')]
    ESTADO_CIVIL_CHOICES = [
        ('SOLTEIRO', 'Solteiro(a)'),
        ('CASADO', 'Casado(a)'),
        ('DIVORCIADO', 'Divorciado(a)'),
        ('VIUVO', 'Viúvo(a)'),
    ]

    # Dados Pessoais
    nome = models.CharField(max_length=255)
    cpf = models.CharField(max_length=14, unique=True)
    foto = models.ImageField(upload_to='membros/fotos/', null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    genero = models.CharField(max_length=10, choices=GENERO_CHOICES, default='M')
    estado_civil = models.CharField(max_length=20, choices=ESTADO_CIVIL_CHOICES, default='SOLTEIRO')
    data_nascimento = models.DateField(null=True, blank=True)
    naturalidade = models.CharField(max_length=2, blank=True, null=True, verbose_name="UF de Nascimento")
    
    # Hierarquia e Status
    funcao = models.ForeignKey(Funcao, on_delete=models.SET_NULL, null=True, blank=True)
    departamento = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='LIGADO')
    
    # Endereço (Visto no seu formulário)
    logradouro = models.CharField(max_length=255, blank=True)
    numero = models.CharField(max_length=20, blank=True)
    complemento = models.CharField(max_length=100, blank=True)
    bairro = models.CharField(max_length=100, blank=True)
    cidade = models.CharField(max_length=100, default='Brasília')
    uf = models.CharField(max_length=2, default='DF')
    cep = models.CharField(max_length=10, blank=True)
    
    # Outros
    observacoes = models.TextField(blank=True)
    motivo_entrada = models.TextField(blank=True, null=True)
    motivo_saida = models.TextField(blank=True, null=True)
    data_entrada = models.DateField(null=True, blank=True)
    data_saida = models.DateField(null=True, blank=True)
    unidade = models.CharField(max_length=100, default='Sede')

    # LGPD
    lgpd_consentido = models.BooleanField(default=False, verbose_name="Termo LGPD Assinado")
    lgpd_data_aceite = models.DateTimeField(null=True, blank=True, verbose_name="Data de Aceite LGPD")
    lgpd_documento = models.FileField(upload_to='membros/lgpd/', null=True, blank=True, verbose_name="Documento LGPD Assinado", storage=RawMediaCloudinaryStorage())

    def save(self, *args, **kwargs):
        if self.nome:
            self.nome = self.nome.upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nome

        
class Parentesco(models.Model):
    GRAU_CHOICES = [
        ('PAI_MAE', 'Pai/Mãe'),
        ('FILHO_A', 'Filho(a)'),
        ('CONJUGE', 'Cônjuge'),
        ('IRMAO_A', 'Irmão(ã)'),
        ('OUTRO', 'Outro'),
    ]
    membro_origem = models.ForeignKey(Membro, related_name='parentescos', on_delete=models.CASCADE)
    membro_destino = models.ForeignKey(Membro, related_name='relacionado_a', on_delete=models.CASCADE)
    grau = models.CharField(max_length=20, choices=GRAU_CHOICES)

    class Meta:
        unique_together = ('membro_origem', 'membro_destino')

    def save(self, *args, **kwargs):
        # 1. Salva a relação original (O que você preencheu no formulário)
        super().save(*args, **kwargs)

        # 2. Mapeamento para criar o inverso
        inverso_map = {
            'PAI_MAE': 'FILHO_A',
            'FILHO_A': 'PAI_MAE',
            'CONJUGE': 'CONJUGE',
            'IRMAO_A': 'IRMAO_A',
            'OUTRO': 'OUTRO'
        }
        
        grau_inv = inverso_map.get(self.grau, 'OUTRO')

        # 3. Tenta criar o inverso. Se der erro (ex: já existe), ele ignora e segue a vida.
        try:
            # Importante: Usamos 'self.membro_destino' como origem da volta
            Parentesco.objects.get_or_create(
                membro_origem=self.membro_destino,
                membro_destino=self.membro_origem,
                defaults={'grau': grau_inv}
            )
        except Exception as e:
            # Apenas loga o erro no terminal, mas NÃO trava o salvamento do usuário
            print(f"Aviso: Não foi possível criar relação inversa: {e}")

class ConfiguracaoPortal(models.Model):
    is_ativo = models.BooleanField(default=True, verbose_name="Portal Ativo")
    pergunta = models.CharField(max_length=255, default="Qual o seu melhor amigo?", verbose_name="Pergunta de Acesso")
    resposta = models.CharField(max_length=255, default="Jesus", verbose_name="Resposta Correta")

    class Meta:
        verbose_name = "Configuração do Portal"
        verbose_name_plural = "Configurações do Portal"

    def __str__(self):
        return f"Configuração Portal - {'Ativo' if self.is_ativo else 'Inativo'}"

    # Garante que só exista uma única configuração no banco
    def save(self, *args, **kwargs):
        if not self.pk and ConfiguracaoPortal.objects.exists():
            # Se já existe uma, impede a criação de outra
            return
        super().save(*args, **kwargs)

class ConfiguracaoSite(models.Model):
    # Dízimos e Ofertas
    pix_chave = models.CharField(max_length=255, default="adcapital.church@gmail.com", verbose_name="Chave PIX")
    banco_nome = models.CharField(max_length=100, default="BANCO DO BRASIL", verbose_name="Nome do Banco")
    beneficiario = models.CharField(max_length=255, default="IGREJA EVANGELICA ASSEMBLEIA DE DEUS MINISTERIO NA CAPITAL", verbose_name="Beneficiário")
    
    # Redes Sociais
    instagram_url = models.URLField(default="https://instagram.com/adcapital.igreja", verbose_name="Instagram")
    youtube_url = models.URLField(default="https://www.youtube.com/@adcapital.church313", verbose_name="YouTube")
    facebook_url = models.URLField(blank=True, null=True, verbose_name="Facebook")
    youtube_channel_id = models.CharField(max_length=50, blank=True, null=True, verbose_name="ID do Canal YouTube (UC...)")
    ultimo_post_instagram_url = models.URLField(blank=True, null=True, verbose_name="URL do Último Post do Instagram")
    
    # Institucional
    video_sobre_nos_url = models.URLField(blank=True, null=True, verbose_name="Vídeo Sobre Nós (YouTube URL)")
    endereco_completo = models.TextField(default="Ch 18 Lt 6/7 Setor de Mansões IAPI - Guará 2 - Brasília - DF - 71.081-245", verbose_name="Endereço Completo")
    google_maps_url = models.URLField(blank=True, null=True, verbose_name="URL do Google Maps")
    
    # Palavra Pastoral
    pastor_nome = models.CharField(max_length=255, default="Pastor Responsável", verbose_name="Nome do Pastor")
    pastoral_titulo = models.CharField(max_length=255, default="Uma Palavra de Fé", verbose_name="Título da Mensagem")
    pastoral_texto = models.TextField(blank=True, verbose_name="Texto da Palavra Pastoral")
    pastor_foto = models.ImageField(upload_to='site/pastor/', blank=True, null=True, verbose_name="Foto do Pastor")

    class Meta:
        verbose_name = "Configuração do Site"
        verbose_name_plural = "Configurações do Site"

    def __str__(self):
        return "Configuração do Site Institucional"

class FotoGaleria(models.Model):
    imagem = models.ImageField(upload_to='site/galeria/', verbose_name="Imagem")
    legenda = models.CharField(max_length=255, blank=True, verbose_name="Legenda")
    ordem = models.PositiveIntegerField(default=0, verbose_name="Ordem de Exibição")
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Foto da Galeria"
        verbose_name_plural = "Fotos da Galeria"
        ordering = ['ordem', '-criado_em']