from django.db import models

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

    def __str__(self):
        return f"{self.tipo} - {self.descricao}"