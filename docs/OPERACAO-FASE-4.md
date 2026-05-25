# Operação — Fase 4 (CI, staging, observabilidade)

## CI (GitHub Actions)

Workflow **CI** (`.github/workflows/ci.yml`) em todo push/PR na `main`:

| Job | Comando | Banco |
|-----|---------|-------|
| Backend | `pytest` | SQLite (sem `DATABASE_URL`) |
| Frontend | `npm test` + `npm run build` | — |

Workflow **Build Android APK** continua separado (push em `adcapital-react/`).

## Staging

Ver [STAGING.md](./STAGING.md) e `render.staging.yaml`.

## Sentry (opcional)

Ative só após criar projeto em [sentry.io](https://sentry.io).

### API (Render — adcapital-api)

| Variável | Exemplo |
|----------|---------|
| `SENTRY_DSN` | `https://...@....ingest.sentry.io/...` |
| `SENTRY_ENVIRONMENT` | `production` ou `staging` |
| `SENTRY_TRACES_SAMPLE_RATE` | `0.1` (opcional) |

### Front (Render — adcapital-web ou build local)

| Variável | Exemplo |
|----------|---------|
| `VITE_SENTRY_DSN` | DSN do projeto React |
| `VITE_SENTRY_ENVIRONMENT` | `production` |

Sem DSN, Sentry não inicializa (zero impacto em dev).

## Backup automático Supabase

Workflow **Supabase Backup** (`.github/workflows/backup-supabase.yml`):

- **Agendado:** diário às 03:00 (horário de Brasília).
- **Manual:** Actions → *Supabase Backup* → Run workflow.

### Secrets necessários (Settings → Secrets → Actions)

| Secret | Uso |
|--------|-----|
| `DATABASE_URL` | Connection string PostgreSQL (Supabase) |
| `SECRET_KEY` | Mesma da API (Django `fast_backup.py`) |

Artifact: `backup-adcapital-<run_id>.json` (retenção 30 dias).

Backup local (igual ao da igreja):

```powershell
.\venv\Scripts\python.exe fast_backup.py
```

O Supabase Pro também oferece backups gerenciados no painel; o workflow é cópia lógica adicional sob controle do repositório.
