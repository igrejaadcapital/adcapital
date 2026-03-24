
from django.apps import AppConfig

class AdcapitalappConfig(AppConfig): # O nome deve ser o que já está no seu arquivo
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'adcapitalapp'

    def ready(self):
        pass # from django.apps import AppConfig
