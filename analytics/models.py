from django.db import models
from django.utils import timezone

class Acesso(models.Model):
    PAGINA_CHOICES = [
        ('SITE', 'Site Público'),
        ('PORTAL', 'Portal do Membro'),
        ('SISTEMA', 'Painel Administrativo'),
    ]
    pagina = models.CharField(max_length=20, choices=PAGINA_CHOICES)
    timestamp = models.DateTimeField(default=timezone.now)
    ip_hash = models.CharField(max_length=64, blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Acesso'
        verbose_name_plural = 'Acessos'
        indexes = [
            models.Index(fields=['pagina', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.get_pagina_display()} em {self.timestamp}"
