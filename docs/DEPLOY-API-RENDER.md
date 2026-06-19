# Deploy da API no Render (adcapital-api)

O arquivo `render.yaml` na raiz cobre **apenas o front estático** (`adcapital-web`).  
A API (`adcapital-api`) foi criada **manualmente** no Dashboard Render. Use este guia para recriar ou auditar.

---

## Serviço API — configuração esperada

| Campo | Valor |
|-------|-------|
| Nome | adcapital-api |
| Tipo | Web Service |
| Runtime | Python 3 |
| Região | Mesma do front (ex.: Oregon / São Paulo se disponível) |
| Branch | main |
| Root directory | `.` (raiz do repo) |
| Build Command | `./build.sh` |
| Start Command | `gunicorn adcapitalcore.wsgi --workers 2 --threads 2 --preload --timeout 120 --log-file -` |
| Plano | Hobby (2 custom domains: api + sistema no front separado) |

---

## Custom domain

- **api.adcapitaligreja.com.br** → CNAME no Cloudflare (proxy laranja) → Render adcapital-api

---

## Variáveis de ambiente (mínimo produção)

Ver `.env.example`. Obrigatórias:

```
DEBUG=False
SECRET_KEY=<forte>
DATABASE_URL=postgresql://...
CRON_SECRET=<forte>
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Opcionais: `SENTRY_DSN`, `JWT_COOKIE_DOMAIN` (default `.adcapitaligreja.com.br`), `CORS_ALLOWED_ORIGINS` (extra).

---

## O que `build.sh` faz

1. `pip install -r requirements.txt`
2. Verifica que `adcapitalapp` não voltou ao settings
3. `collectstatic`
4. `createcachetable` (rate limit / cache DB)
5. `migrate` + `repair_db.py` (até 3 tentativas)

---

## Staging

Blueprint completo (API + web): `render.staging.yaml` — ver `docs/STAGING.md`.

Para alinhar produção ao staging no futuro, estender `render.yaml` com bloco web service espelhando staging (não feito no handoff para não alterar infra live sem titular).

---

## Pós-deploy

```powershell
.\venv\Scripts\python.exe scripts\smoke_producao.py
```

Confere: ping, login, RBAC, front sistema e auto-cadastro.

---

## Rollback

Tag Git: `prod-pre-fase1-20260522` — `docs/ROLLBACK-FASE-1.md`.
