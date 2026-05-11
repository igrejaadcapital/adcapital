"""
WSGI config for adcapitalcore project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adcapitalcore.settings')

application = get_wsgi_application()

# [KEEP-ALIVE] Inicia o self-ping automático ao boot do servidor
# Delay de 30s para não competir com a inicialização do Gunicorn
import threading
def _start_keep_alive_delayed():
    import time
    time.sleep(30)  # Espera o servidor estabilizar
    try:
        from membros.views import _garantir_keep_alive
        _garantir_keep_alive()
        print("[WSGI] Keep-Alive iniciado automaticamente no boot.")
    except Exception as e:
        print(f"[WSGI] Erro ao iniciar Keep-Alive: {e}")

threading.Thread(target=_start_keep_alive_delayed, daemon=True).start()
