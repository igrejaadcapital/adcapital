"""Self-ping para reduzir cold start no Render Free."""
import os
import threading
import time
import urllib.request

_keep_alive_started = False
_keep_alive_lock = threading.Lock()


def _self_keep_alive_loop():
    render_host = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
    if render_host:
        api_url = f'https://{render_host}'
    else:
        api_url = os.environ.get('RENDER_EXTERNAL_URL', 'https://api.adcapitaligreja.com.br')

    ping_url = f"{api_url.rstrip('/')}/api/ping/"
    print(f'[Keep-Alive] Monitor iniciado para: {ping_url}')

    while True:
        time.sleep(240)
        try:
            headers = {'User-Agent': 'SelfKeepAlive/1.1', 'Accept': 'application/json'}
            req = urllib.request.Request(ping_url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as response:
                if response.status == 200:
                    print(f'[Keep-Alive] Self-ping OK em {ping_url}')
                else:
                    print(f'[Keep-Alive] Self-ping retornou status {response.status}')
        except Exception as e:
            print(f'[Keep-Alive] Falha no self-ping: {e}')


def garantir_keep_alive():
    global _keep_alive_started
    if _keep_alive_started:
        return
    with _keep_alive_lock:
        if _keep_alive_started:
            return
        _keep_alive_started = True
        threading.Thread(target=_self_keep_alive_loop, daemon=True).start()
        print('[Keep-Alive] Thread de self-ping iniciada (intervalo: 4 min)')
