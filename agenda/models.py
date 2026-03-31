from django.db import models
from .services import sync_event_to_google, update_event_to_google, delete_event_from_google

class Evento(models.Model):
    titulo = models.CharField(max_length=200, verbose_name="Título do Evento")
    descricao = models.TextField(blank=True, null=True, verbose_name="Descrição")
    data_inicio = models.DateTimeField(verbose_name="Data/Hora de Início")
    data_fim = models.DateTimeField(verbose_name="Data/Hora de Término")
    google_event_id = models.CharField(max_length=255, blank=True, null=True, verbose_name="ID no Google Calendar")

    def __str__(self):
        return self.titulo

    class Meta:
        verbose_name = "Evento"
        verbose_name_plural = "Eventos"
        ordering = ['data_inicio']

    def save(self, *args, **kwargs):
        # Primeiro, salva no banco local (para garantir que temos um ID local etc)
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # Se for novo E não tiver ID do Google, cria no Google
        if is_new and not self.google_event_id:
            google_id = sync_event_to_google(
                titulo=self.titulo,
                descricao=self.descricao or "",
                data_inicio=self.data_inicio,
                data_fim=self.data_fim
            )
            if google_id:
                self.google_event_id = google_id
                super().save(update_fields=['google_event_id'])
        
        # Se NÃO for novo e tiver ID do Google, atualiza no Google
        elif not is_new and self.google_event_id:
            update_event_to_google(
                google_event_id=self.google_event_id,
                titulo=self.titulo,
                descricao=self.descricao or "",
                data_inicio=self.data_inicio,
                data_fim=self.data_fim
            )

    def delete(self, *args, **kwargs):
        # Tenta deletar no Google antes de apagar do sistema
        if self.google_event_id:
            delete_event_from_google(self.google_event_id)
        
        super().delete(*args, **kwargs)
