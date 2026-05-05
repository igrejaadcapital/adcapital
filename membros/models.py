# -*- coding: utf-8 -*-
from django.db import models
from cloudinary_storage.storage import RawMediaCloudinaryStorage

class Funcao(models.Model):
    nome = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nome

class Membro(models.Model):
    # OpÃ§Ãµes que vocÃª jÃ¡ tinha definido (Mantido do adcapitalapp)
    FUNCOES_CHOICES = [
        ('MEMBRO', 'Membro'),
        ('PASTOR', 'Pastor(a)'),
        ('PRESBITERO', 'PresbÃ­tero'),
        ('DIACONO', 'DiÃ¡cono/Diaconisa'),
        ('EVANGELISTA', 'Evangelista'),
        ('MISSIONARIO', 'MissionÃ¡rio(a)'),
        ('COOPERADOR', 'Cooperador(a)'),
    ]

    GENERO_CHOICES = [('M', 'VarÃ£o'), ('F', 'Varoa')]
    STATUS_CHOICES = [('LIGADO', 'Ligado'), ('DESLIGADO', 'Desligado')]
    ESTADO_CIVIL_CHOICES = [
        ('SOLTEIRO', 'Solteiro(a)'),
        ('CASADO', 'Casado(a)'),
        ('DIVORCIADO', 'Divorciado(a)'),
        ('VIUVO', 'ViÃºvo(a)'),
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
    
    # EndereÃ§o (Visto no seu formulÃ¡rio)
    logradouro = models.CharField(max_length=255, blank=True)
    numero = models.CharField(max_length=20, blank=True)
    complemento = models.CharField(max_length=100, blank=True)
    bairro = models.CharField(max_length=100, blank=True)
    cidade = models.CharField(max_length=100, default='BrasÃ­lia')
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
        ('PAI_MAE', 'Pai/MÃ£e'),
        ('FILHO_A', 'Filho(a)'),
        ('CONJUGE', 'CÃ´njuge'),
        ('IRMAO_A', 'IrmÃ£o(Ã£)'),
        ('OUTRO', 'Outro'),
    ]
    membro_origem = models.ForeignKey(Membro, related_name='parentescos', on_delete=models.CASCADE)
    membro_destino = models.ForeignKey(Membro, related_name='relacionado_a', on_delete=models.CASCADE)
    grau = models.CharField(max_length=20, choices=GRAU_CHOICES)

    class Meta:
        unique_together = ('membro_origem', 'membro_destino')

    def save(self, *args, **kwargs):
        # 1. Salva a relaÃ§Ã£o original (O que vocÃª preencheu no formulÃ¡rio)
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

        # 3. Tenta criar o inverso. Se der erro (ex: jÃ¡ existe), ele ignora e segue a vida.
        try:
            # Importante: Usamos 'self.membro_destino' como origem da volta
            Parentesco.objects.get_or_create(
                membro_origem=self.membro_destino,
                membro_destino=self.membro_origem,
                defaults={'grau': grau_inv}
            )
        except Exception as e:
            # Apenas loga o erro no terminal, mas NÃO trava o salvamento do usuÃ¡rio
            print(f"Aviso: NÃ£o foi possÃ­vel criar relaÃ§Ã£o inversa: {e}")

from django.db.models.signals import post_delete
from django.dispatch import receiver

@receiver(post_delete, sender=Parentesco)
def apagar_parentesco_inverso(sender, instance, **kwargs):
    """
    Sempre que um vÃ­nculo (A -> B) for deletado, apaga automaticamente o inverso (B -> A).
    Isso previne 'Ã³rfÃ£os' no banco quando o usuÃ¡rio apaga relaÃ§Ãµes pela interface.
    """
    try:
        # filter().delete() Ã© seguro contra loop infinito porque se jÃ¡ nÃ£o existir, nÃ£o farÃ¡ nada.
        Parentesco.objects.filter(
            membro_origem=instance.membro_destino,
            membro_destino=instance.membro_origem
        ).delete()
    except Exception:
        pass

class ConfiguracaoPortal(models.Model):
    is_ativo = models.BooleanField(default=True, verbose_name="Portal Ativo")
    pergunta = models.CharField(max_length=255, default="Qual o seu melhor amigo?", verbose_name="Pergunta de Acesso")
    resposta = models.CharField(max_length=255, default="Jesus", verbose_name="Resposta Correta")

    class Meta:
        verbose_name = "ConfiguraÃ§Ã£o do Portal"
        verbose_name_plural = "ConfiguraÃ§Ãµes do Portal"

    def __str__(self):
        return f"ConfiguraÃ§Ã£o Portal - {'Ativo' if self.is_ativo else 'Inativo'}"

    # Garante que sÃ³ exista uma Ãºnica configuraÃ§Ã£o no banco
    def save(self, *args, **kwargs):
        if not self.pk and ConfiguracaoPortal.objects.exists():
            # Se jÃ¡ existe uma, impede a criaÃ§Ã£o de outra
            return
        super().save(*args, **kwargs)

class ConfiguracaoSite(models.Model):
    # DÃ­zimos e Ofertas
    pix_chave = models.CharField(max_length=255, default="adcapital.church@gmail.com", verbose_name="Chave PIX")
    banco_nome = models.CharField(max_length=100, default="BANCO DO BRASIL", verbose_name="Nome do Banco")
    beneficiario = models.CharField(max_length=255, default="IGREJA EVANGELICA ASSEMBLEIA DE DEUS MINISTERIO NA CAPITAL", verbose_name="BeneficiÃ¡rio")
    
    # Redes Sociais
    instagram_url = models.URLField(default="https://instagram.com/adcapital.igreja", verbose_name="Instagram")
    youtube_url = models.URLField(default="https://www.youtube.com/@adcapital.church313", verbose_name="YouTube")
    facebook_url = models.URLField(blank=True, null=True, verbose_name="Facebook")
    youtube_channel_id = models.CharField(max_length=50, blank=True, null=True, verbose_name="ID do Canal YouTube (UC...)")
    ultimo_post_instagram_url = models.URLField(blank=True, null=True, verbose_name="URL do Ãltimo Post do Instagram")
    
    # Institucional
    video_sobre_nos_url = models.URLField(blank=True, null=True, verbose_name="VÃ­deo Sobre NÃ³s (YouTube URL)")
    endereco_completo = models.TextField(default="Ch 18 Lt 6/7 Setor de MansÃµes IAPI - GuarÃ¡ 2 - BrasÃ­lia - DF - 71.081-245", verbose_name="EndereÃ§o Completo")
    google_maps_url = models.URLField(blank=True, null=True, verbose_name="URL do Google Maps")
    
    # Palavra Pastoral
    pastor_nome = models.CharField(max_length=255, default="Pastor ResponsÃ¡vel", verbose_name="Nome do Pastor")
    pastoral_titulo = models.CharField(max_length=255, default="Uma Palavra de FÃ©", verbose_name="TÃ­tulo da Mensagem")
    pastoral_texto = models.TextField(blank=True, verbose_name="Texto da Palavra Pastoral")
    pastor_foto = models.ImageField(upload_to='site/pastor/', blank=True, null=True, verbose_name="Foto do Pastor")

    class Meta:
        verbose_name = "ConfiguraÃ§Ã£o do Site"
        verbose_name_plural = "ConfiguraÃ§Ãµes do Site"

    def __str__(self):
        return "ConfiguraÃ§Ã£o do Site Institucional"

class FotoGaleria(models.Model):
    imagem = models.ImageField(upload_to='site/galeria/', verbose_name="Imagem")
    legenda = models.CharField(max_length=255, blank=True, verbose_name="Legenda")
    ordem = models.PositiveIntegerField(default=0, verbose_name="Ordem de ExibiÃ§Ã£o")
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Foto da Galeria"
        verbose_name_plural = "Fotos da Galeria"
        ordering = ['ordem', '-criado_em']

from django.contrib.auth.models import User

class Perfil(models.Model):
    ROLES = [
        ('ADMIN', 'Administrador'),
        ('SECRETARIO', 'Secretário(a)'),
        ('TESOUREIRO', 'Tesoureiro(a)'),
        ('MEMBRO', 'Membro'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    role = models.CharField(max_length=20, choices=ROLES, default='MEMBRO')
    membro = models.OneToOneField(Membro, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_profile')

    def __str__(self):
        return f'{self.user.username} - {self.role}'

@receiver(models.signals.post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Perfil.objects.get_or_create(user=instance)

@receiver(models.signals.post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'perfil'):
        instance.perfil.save()
