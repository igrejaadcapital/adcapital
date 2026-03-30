from django.db import models

class CategoriaFinanceira(models.Model):
    TIPO_CHOICES = [
        ('ENTRADA', 'Entrada'),
        ('SAIDA', 'Saída'),
    ]
    nome = models.CharField(max_length=100)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)

    class Meta:
        unique_together = ('nome', 'tipo')

    def __str__(self):
        return f"{self.nome} ({self.tipo})"

class Transacao(models.Model):
    TIPO_CHOICES = [
        ('ENTRADA', 'Entrada'),
        ('SAIDA', 'Saída'),
    ]

    descricao = models.CharField(max_length=255)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    categoria = models.CharField(max_length=100) # Ex: Dízimo, Aluguel
    data = models.DateField()
    comprovante = models.FileField(upload_to='comprovantes/', blank=True, null=True)

    def __str__(self):
        return f"{self.tipo} - {self.descricao}"