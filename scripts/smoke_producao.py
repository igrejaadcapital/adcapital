#!/usr/bin/env python
"""Smoke tests — API produção + RBAC via JWT (usuários reais no banco)."""
import json
import os
import sys
from pathlib import Path

import django

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adcapitalcore.settings')

# Carrega .env local (DATABASE_URL, CRON_SECRET opcional)
from dotenv import load_dotenv

load_dotenv(ROOT / '.env')

API = os.environ.get('SMOKE_API_BASE', 'https://api.adcapitaligreja.com.br/api').rstrip('/')
CRON_SECRET = os.environ.get('CRON_SECRET', '').strip()
SMOKE_ADMIN_USER = os.environ.get('SMOKE_ADMIN_USER', '').strip()
SMOKE_ADMIN_PASSWORD = os.environ.get('SMOKE_ADMIN_PASSWORD', '').strip()
IS_REMOTE_PROD = 'adcapitaligreja.com.br' in API
IS_LOCAL_API = 'localhost' in API or '127.0.0.1' in API


def http(method, path, *, headers=None, data=None, timeout=45):
    import urllib.error
    import urllib.request

    url = f'{API}{path}'
    body = None
    hdrs = {
        'User-Agent': 'Mozilla/5.0 (compatible; ADCapital-Smoke/1.0)',
        'Accept': 'application/json',
    }
    hdrs.update(headers or {})
    if data is not None:
        body = json.dumps(data).encode('utf-8')
        hdrs.setdefault('Content-Type', 'application/json')
    req = urllib.request.Request(url, data=body, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode('utf-8', errors='replace')
            limit = 8000 if '/token/' in path else 400
            return resp.status, body[:limit]
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        limit = 8000 if '/token/' in path else 400
        return e.code, body[:limit]


def site_ok(url):
    import urllib.request

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'ADCapital-Smoke/1.0'})
        with urllib.request.urlopen(req, timeout=25) as resp:
            return resp.status == 200, f'status={resp.status}'
    except Exception as exc:
        return False, str(exc)


def main():
    results = []

    def check(name, ok, detail=''):
        if ok is None:
            results.append((name, 'PULADO', detail))
            print(f'[PULADO] {name}' + (f' — {detail}' if detail else ''))
            return
        results.append((name, 'OK' if ok else 'FALHOU', detail))
        mark = 'OK' if ok else 'FALHOU'
        print(f'[{mark}] {name}' + (f' — {detail}' if detail else ''))

    # --- API anônima ---
    s, _ = http('GET', '/debug/migrate/')
    check('GET /api/debug/migrate/ -> 404', s == 404, f'status={s}')

    s, _ = http('GET', '/financeiro/transacoes/')
    check('Financeiro sem token -> 401', s == 401, f'status={s}')

    s, _ = http('GET', '/verificar-aniversarios/')
    check('Aniversários sem segredo -> 403', s == 403, f'status={s}')

    if CRON_SECRET:
        s, _ = http('GET', '/verificar-aniversarios/', headers={'X-Cron-Secret': CRON_SECRET})
        check('Aniversários com X-Cron-Secret -> 200', s == 200, f'status={s}')
    else:
        check('Aniversários com X-Cron-Secret -> 200', None, 'CRON_SECRET não está no .env local')

    s, _ = http('GET', '/configuracao-site/')
    check('Configuração site -> 200', s == 200, f'status={s}')

    s, _ = http('GET', '/init-publico/')
    check('Init público (auto-cadastro) -> 200', s == 200, f'status={s}')

    # Rate limit (cache PostgreSQL — efetivo após deploy; teste completo só em API local)
    if IS_LOCAL_API:
        saw_429 = False
        last_status = None
        for _ in range(12):
            last_status, _ = http(
                'POST',
                '/token/',
                data={'username': '00000000000', 'password': 'invalido-smoke'},
            )
            if last_status == 429:
                saw_429 = True
                break
        check(
            'Rate limit login (API local) -> 429',
            saw_429,
            f'ultimo status={last_status}',
        )
    else:
        check(
            'Rate limit login em produção',
            None,
            'validar após deploy com DatabaseCache (createcachetable)',
        )

    s, _ = http('POST', '/token/', data={'username': '00000000000', 'password': 'invalido-smoke'})
    check('POST /api/token/ rejeita senha invalida -> 401/400', s in (400, 401), f'status={s}')

    # --- Frontends ---
    ok, det = site_ok('https://cadastro.adcapitaligreja.com.br/')
    check('cadastro.adcapitaligreja.com.br carrega', ok, det)

    ok, det = site_ok('https://sistema.adcapitaligreja.com.br/')
    check('sistema.adcapitaligreja.com.br carrega', ok, det)

    # --- RBAC na API (login real em produção; JWT local só em API local) ---
    def _token_from_login(username, password):
        status, body = http('POST', '/token/', data={'username': username, 'password': password})
        if status != 200:
            return None, status
        try:
            return json.loads(body).get('access'), status
        except json.JSONDecodeError:
            return None, status

    if SMOKE_ADMIN_USER and SMOKE_ADMIN_PASSWORD:
        admin_token, login_status = _token_from_login(SMOKE_ADMIN_USER, SMOKE_ADMIN_PASSWORD)
        if admin_token:
            s, _ = http(
                'GET',
                '/financeiro/transacoes/',
                headers={'Authorization': f'Bearer {admin_token}'},
            )
            check('ADMIN: GET financeiro/transacoes -> 200', s == 200, f'status={s}')

            s, _ = http(
                'GET',
                '/membros/',
                headers={'Authorization': f'Bearer {admin_token}'},
            )
            check('ADMIN: GET membros/ -> 200', s == 200, f'status={s}')
        else:
            check(
                'ADMIN: login smoke (token no JSON)',
                False,
                f'status login={login_status}',
            )
    elif IS_REMOTE_PROD:
        check(
            'RBAC ADMIN na API produção',
            None,
            'opcional: SMOKE_ADMIN_USER + SMOKE_ADMIN_PASSWORD no .env',
        )
    elif IS_LOCAL_API:
        os.environ['DEBUG'] = 'True'
        django.setup()
        from membros.models import Perfil
        from rest_framework_simplejwt.tokens import AccessToken

        admin_perfil = Perfil.objects.filter(role='ADMIN').select_related('user').first()
        membro_perfil = Perfil.objects.filter(role='MEMBRO').select_related('user').first()

        if admin_perfil:
            admin_token = str(AccessToken.for_user(admin_perfil.user))
            s, _ = http(
                'GET',
                '/financeiro/transacoes/',
                headers={'Authorization': f'Bearer {admin_token}'},
            )
            check('ADMIN: GET financeiro/transacoes -> 200', s == 200, f'status={s}')
        else:
            check('ADMIN: financeiro', None, 'nenhum ADMIN no banco')

        if membro_perfil:
            membro_token = str(AccessToken.for_user(membro_perfil.user))
            s, _ = http(
                'GET',
                '/financeiro/transacoes/',
                headers={'Authorization': f'Bearer {membro_token}'},
            )
            check('MEMBRO: GET financeiro/transacoes -> 403', s == 403, f'status={s}')
        else:
            check('MEMBRO: financeiro -> 403', None, 'nenhum MEMBRO no banco')
    else:
        check('RBAC na API', None, 'configure SMOKE_API_BASE ou credenciais smoke')

    print('\n--- Resumo ---')
    for name, status, detail in results:
        if status != 'OK':
            print(f'  {status}: {name} {detail}')
    failed = sum(1 for _, st, _ in results if st == 'FALHOU')
    passed = sum(1 for _, st, _ in results if st == 'OK')
    skipped = sum(1 for _, st, _ in results if st == 'PULADO')
    print(f'\nPassou: {passed} | Falhou: {failed} | Pulado: {skipped}')
    return 1 if failed else 0


if __name__ == '__main__':
    raise SystemExit(main())
