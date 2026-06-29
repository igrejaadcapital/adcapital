"""Self-ping para reduzir cold start no Render Free (horário ativo configurável)."""
from __future__ import annotations

import os
import threading
import time
import urllib.request
from datetime import datetime
from zoneinfo import ZoneInfo

_keep_alive_started = False
_keep_alive_lock = threading.Lock()

DEFAULT_INTERVAL_SECONDS = 240
DEFAULT_QUIET_START = 23
DEFAULT_QUIET_END = 6
DEFAULT_TIMEZONE = 'America/Sao_Paulo'
QUIET_POLL_SECONDS = 300


def _env_bool(name: str, default: bool = True) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in ('1', 'true', 'yes', 'on')


def _env_int(name: str, default: int) -> int:
    raw = os.environ.get(name)
    if raw is None or not raw.strip():
        return default
    try:
        return int(raw.strip())
    except ValueError:
        return default


def keep_alive_config() -> dict:
    return {
        'enabled': _env_bool('KEEP_ALIVE_ENABLED', True),
        'interval_seconds': max(60, _env_int('KEEP_ALIVE_INTERVAL_SECONDS', DEFAULT_INTERVAL_SECONDS)),
        'quiet_start': _env_int('KEEP_ALIVE_QUIET_START', DEFAULT_QUIET_START) % 24,
        'quiet_end': _env_int('KEEP_ALIVE_QUIET_END', DEFAULT_QUIET_END) % 24,
        'timezone': os.environ.get('KEEP_ALIVE_TIMEZONE', DEFAULT_TIMEZONE).strip() or DEFAULT_TIMEZONE,
    }


def em_horario_quieto(
    now: datetime | None = None,
    *,
    quiet_start: int | None = None,
    quiet_end: int | None = None,
    timezone: str | None = None,
) -> bool:
    """True entre quiet_start e quiet_end (suporta janela overnight, ex.: 23h–6h)."""
    cfg = keep_alive_config()
    tz_name = timezone or cfg['timezone']
    start = DEFAULT_QUIET_START if quiet_start is None else quiet_start % 24
    end = DEFAULT_QUIET_END if quiet_end is None else quiet_end % 24

    if start == end:
        return False

    try:
        tz = ZoneInfo(tz_name)
    except Exception:
        tz = ZoneInfo(DEFAULT_TIMEZONE)

    local_now = now.astimezone(tz) if now is not None else datetime.now(tz)
    hour = local_now.hour

    if start > end:
        return hour >= start or hour < end
    return start <= hour < end


def _ping_url() -> str:
    render_host = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
    if render_host:
        api_url = f'https://{render_host}'
    else:
        api_url = os.environ.get('RENDER_EXTERNAL_URL', 'https://api.adcapitaligreja.com.br')
    return f"{api_url.rstrip('/')}/api/ping/"


def _executar_ping(ping_url: str) -> None:
    headers = {'User-Agent': 'SelfKeepAlive/1.2', 'Accept': 'application/json'}
    req = urllib.request.Request(ping_url, headers=headers)
    with urllib.request.urlopen(req, timeout=20) as response:
        if response.status == 200:
            print(f'[Keep-Alive] Self-ping OK em {ping_url}')
        else:
            print(f'[Keep-Alive] Self-ping retornou status {response.status}')


def _self_keep_alive_loop():
    cfg = keep_alive_config()
    if not cfg['enabled']:
        print('[Keep-Alive] Desabilitado (KEEP_ALIVE_ENABLED=false).')
        return

    ping_url = _ping_url()
    print(
        '[Keep-Alive] Monitor iniciado para: '
        f'{ping_url} | intervalo={cfg["interval_seconds"]}s | '
        f'quieto={cfg["quiet_start"]:02d}h-{cfg["quiet_end"]:02d}h ({cfg["timezone"]})'
    )

    while True:
        if em_horario_quieto():
            print('[Keep-Alive] Horário de stand-by — ping omitido (cold start permitido).')
            time.sleep(QUIET_POLL_SECONDS)
            continue

        try:
            _executar_ping(ping_url)
        except Exception as e:
            print(f'[Keep-Alive] Falha no self-ping: {e}')

        time.sleep(cfg['interval_seconds'])


def garantir_keep_alive():
    global _keep_alive_started
    if _keep_alive_started:
        return
    with _keep_alive_lock:
        if _keep_alive_started:
            return
        _keep_alive_started = True
        threading.Thread(target=_self_keep_alive_loop, daemon=True).start()
        cfg = keep_alive_config()
        print(
            '[Keep-Alive] Thread iniciada '
            f'(intervalo ativo: {cfg["interval_seconds"]}s; '
            f'stand-by {cfg["quiet_start"]:02d}h-{cfg["quiet_end"]:02d}h {cfg["timezone"]}).'
        )
