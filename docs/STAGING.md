# Ambiente staging — AD Capital

Staging valida deploy antes de produção, com URLs e variáveis separadas.

## URLs sugeridas (Cloudflare + Render)

| Serviço | URL staging | Produção |
|---------|-------------|----------|
| Front | `staging.sistema.adcapitaligreja.com.br` | `sistema.adcapitaligreja.com.br` |
| API | `staging-api.adcapitaligreja.com.br` | `api.adcapitaligreja.com.br` |

Alternativa: use os hostnames `*.onrender.com` do Render até configurar DNS.

## Criar serviços no Render

1. **Blueprint:** importe `render.staging.yaml` (New → Blueprint) ou duplique `adcapital-api` / `adcapital-web` manualmente.
2. **Variáveis obrigatórias** no serviço `adcapital-api-staging`:
   - `DJANGO_ENV=staging`
   - `DATABASE_URL` — recomendado: projeto Supabase **separado** de teste (não usar produção).
   - `SECRET_KEY`, `CRON_SECRET`, Cloudinary (pode ser o mesmo ou bucket de teste).
3. **Front** `adcapital-web-staging`:
   - `VITE_API_URL=https://staging-api.adcapitaligreja.com.br/api/v1`
   - `VITE_SENTRY_ENVIRONMENT=staging` (opcional)
4. **CORS:** com `DJANGO_ENV=staging`, a API aceita origens `staging.*` automaticamente (`settings.py`).

## Deploy

- Push na branch configurada no serviço staging, ou **Manual Deploy** no painel Render.
- CI em `main` não substitui staging; cada serviço tem deploy independente.

## Checklist pós-deploy staging

```bash
curl -s https://staging-api.adcapitaligreja.com.br/api/v1/ping/
curl -s https://staging-api.adcapitaligreja.com.br/api/v1/health/
```

Login e fluxos críticos no front staging antes de promover alterações à produção.
