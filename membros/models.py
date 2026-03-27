from django.db import models

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

    GENERO_CHOICES = [('M', 'Masculino'), ('F', 'Feminino')]
    STATUS_CHOICES = [('LIGADO', 'Ligado'), ('DESLIGADO', 'Desligado')]

    # Dados Pessoais
    nome = models.CharField(max_length=255)
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    genero = models.CharField(max_length=1, choices=GENERO_CHOICES, default='M')
    data_nascimento = models.DateField(null=True, blank=True)
    
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
    data_entrada = models.DateField(null=True, blank=True)
    data_saida = models.DateField(null=True, blank=True)

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