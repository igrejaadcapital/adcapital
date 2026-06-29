# Alertas de infraestrutura por e-mail

Monitora **disponibilidade** (Render, API, front) e **vencimentos** (SSL, renovações cadastradas) e envia e-mail via **Resend**.

## O que é verificado automaticamente

| Check | Detecta |
|-------|---------|
| SSL (4 hosts) | Certificado expirado ou vencendo em 30 dias |
| API `/ping/` e `/health/` | API Render suspensa / cold start prolongado |
| Front `sistema.*` e site | Static site Render fora do ar |
| Auto-cadastro | Front `#/cadastro` indisponível |
| PostgreSQL | Falha de conexão Supabase (quando `--com-banco`) |
| Resend | `RESEND_API_KEY` ausente |

## Vencimentos manuais

Edite **`docs/alertas-vencimentos.json`** com datas `YYYY-MM-DD` quando souber a renovação:

- Registro.br (domínio)
- Planos pagos (Render, Supabase, Cloudinary, etc.)

Serviços com `"vencimento": null` só entram no relatório semanal como lembrete.

## Variáveis de ambiente

| Variável | Onde | Descrição |
|----------|------|-----------|
| `RESEND_API_KEY` | Render API + GitHub Secret | Envio de e-mail (já usada no cadastro) |
| `ALERTAS_EMAIL_PARA` | GitHub Secret / Render | Destinatários separados por vírgula |
| `ALERTAS_VENCIMENTOS` | Opcional | JSON inline (sobrescreve o arquivo) |

**GitHub:** Settings → Secrets → Actions → adicionar `RESEND_API_KEY` e `ALERTAS_EMAIL_PARA` (ex.: `igrejaadcapital@gmail.com`).

## Comandos

```bash
# Ver relatório sem enviar
python manage.py alertas_servicos --dry-run

# Enviar só se houver aviso/crítico
python manage.py alertas_servicos --com-banco

# Forçar e-mail (teste)
python manage.py alertas_servicos --com-banco --sempre-enviar

# Segunda-feira: relatório completo mesmo se OK (--semanal)
python manage.py alertas_servicos --com-banco --semanal
```

## Agendamento (GitHub Actions)

Workflow **`.github/workflows/alertas-infra.yml`**:

- **Diário** 08h Brasília — e-mail se houver problema
- **Segundas** — relatório completo (`--semanal`)

Disparo manual: GitHub → Actions → *Alertas infraestrutura* → Run workflow.

## Limitações

- **Registro.br / faturas:** não há API pública — cadastre a data em `alertas-vencimentos.json`.
- **Render Free suspendendo:** detectado quando ping falha; não avisa antes.
- **Apple / Google Play:** não monitorados (sem app iOS na loja).

## Keep-alive Render (horas free)

Self-ping na API com **stand-by 23h–6h (Brasília)** para economizar horas do plano free.

| Variável (Render → adcapital-api) | Valor sugerido |
|-----------------------------------|----------------|
| `KEEP_ALIVE_QUIET_START` | `23` |
| `KEEP_ALIVE_QUIET_END` | `6` |
| `KEEP_ALIVE_TIMEZONE` | `America/Sao_Paulo` |
| `KEEP_ALIVE_INTERVAL_SECONDS` | `1800` (30 min no horário ativo) |
| `KEEP_ALIVE_ENABLED` | `true` |

**Importante:** no [cron-job.org](https://cron-job.org), o job de keep-alive (`GET /api/v1/configuracao-site/`) deve rodar **só entre 6h e 23h**. Se continuar a cada 10 min à noite, a API não dorme.

## Relacionados

- Keep-alive externo (horário ativo): cron-job.org → `/api/v1/configuracao-site/`
- Smoke manual: `python scripts/smoke_producao.py`
- Backup diário: `.github/workflows/backup-supabase.yml`
