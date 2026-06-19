# Contas e secrets — template (NÃO COMMITAR COM SENHAS)

**Instrução:** copie este arquivo para um local **privado** (1Password, Bitwarden, papel do tesoureiro/TI).  
**Nunca** commite o arquivo preenchido no Git.

---

## Repositório

| Campo | Valor |
|-------|-------|
| GitHub org/user | igrejaadcapital |
| Repositório | adcapital |
| Branch produção | main |
| URL clone | https://github.com/igrejaadcapital/adcapital.git |

---

## Render (dashboard.render.com)

| Serviço | Nome no Render | Tipo | Custom domain |
|---------|----------------|------|---------------|
| API | adcapital-api | Web Service (Python) | api.adcapitaligreja.com.br |
| Front | adcapital-web | Static Site | sistema.adcapitaligreja.com.br |

**Build API:** `build.sh` · **Start:** `Procfile` (gunicorn)

### Env vars API (adcapital-api)

| Variável | Preenchido? | Notas |
|----------|-------------|-------|
| SECRET_KEY | [ ] | Mesmo valor usado no GitHub Secret backup |
| DATABASE_URL | [ ] | Supabase pooler |
| DEBUG | [ ] | False |
| CRON_SECRET | [ ] | Igual ao header no cron-job.org |
| CLOUDINARY_* | [ ] | 3 variáveis |
| JWT_COOKIE_DOMAIN | [ ] | .adcapitaligreja.com.br |
| SENTRY_DSN | [ ] | Opcional |

### Env vars Front (adcapital-web)

| Variável | Preenchido? | Notas |
|----------|-------------|-------|
| VITE_API_URL | [ ] | https://api.adcapitaligreja.com.br/api/v1 |
| VITE_GA_MEASUREMENT_ID | [ ] | G-7KZ3C5J6TH (prod) |

---

## GitHub Actions — Secrets

| Secret | Usado em |
|--------|----------|
| DATABASE_URL | backup-supabase.yml, auditar-lgpd.yml |
| SECRET_KEY | idem |
| APK_KEYSTORE_BASE64 | android-apk.yml (opcional) |
| APK_KEYSTORE_PASS | idem |

---

## Cloudflare

| Campo | Valor |
|-------|-------|
| Conta e-mail | |
| Zona | adcapitaligreja.com.br |
| DNS sistema | CNAME → Render web |
| DNS api | CNAME → Render API |
| SSL | Universal SSL |

**Removido:** registro `cadastro` (jun/2026)

---

## Supabase

| Campo | Valor |
|-------|-------|
| Projeto | |
| Região | sa-east-1 |
| Connection string | (DATABASE_URL) |

---

## Cloudinary

| Campo | Valor |
|-------|-------|
| Cloud name | |
| API Key | |
| API Secret | (só Render .env) |

---

## cron-job.org

| Job | URL | Header |
|-----|-----|--------|
| Keep-alive | GET .../api/v1/configuracao-site/ | — |
| Aniversários | GET .../api/v1/verificar-aniversarios/ | X-Cron-Secret: *** |

---

## Google Analytics

| Campo | Valor |
|-------|-------|
| Measurement ID | G-7KZ3C5J6TH |

---

## Android APK

| Campo | Valor |
|-------|-------|
| Keystore local | adcapital-react/android/ (não commitar) |
| CI Release | GitHub Releases tag apk-latest |
| App ID | br.com.adcapitaligreja.sistema |

---

## iPhone

| Campo | Valor |
|-------|-------|
| App Store | **Não publicado** |
| Solução | Safari → sistema.adcapitaligreja.com.br → Tela de Início |

---

## Pessoas de contato TI

| Papel | Nome | Contato |
|-------|------|---------|
| Admin sistema | | |
| Render/Cloudflare | | |

---

*Template handoff jun/2026 — preencher offline e guardar em local seguro.*
