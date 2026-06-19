# Igreja AD Capital — Sistema Pastoral

Monorepo do ecossistema digital da AD Capital: API Django, SPA React e app Android (Capacitor).

## Estrutura

| Pasta | Conteúdo |
|-------|----------|
| `adcapitalcore/` | Configuração Django, rotas `/api/v1/` |
| `membros/` | Membros, portal, cadastro, LGPD, usuários |
| `financeiro/` | Transações, categorias, exportação contábil |
| `agenda/` | Eventos e programação |
| `analytics/` | Métricas e dashboard |
| `adcapital-react/` | Frontend React 19 + Vite + Capacitor |
| `docs/` | Manuais, fases, operação, SSL |

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [ARQUITETURA.md](./ARQUITETURA.md) | Manual principal (URLs, infra, RBAC, fases) |
| [docs/README.md](./docs/README.md) | **Índice** de todos os manuais |
| [docs/PLANO-REFATORACAO.md](./docs/PLANO-REFATORACAO.md) | Roadmap fases 0–6 |
| [docs/FASE-5-QUALIDADE.md](./docs/FASE-5-QUALIDADE.md) | Qualidade e consolidação |
| [docs/FASE-6-EVOLUCAO.md](./docs/FASE-6-EVOLUCAO.md) | Evolução atual |
| [docs/HANDOFF.md](./docs/HANDOFF.md) | **Avaliação e handoff** para retomar o projeto |
| [AGENTS.md](./AGENTS.md) | Guia rápido para IA ou dev novo |

Wiki no sistema: **Configurações → aba Wiki** (espelha a arquitetura + handoff).

## Como retornar ao projeto

Para **TI**, **novo dev** ou **nova assinatura de IA** retomar o trabalho:

1. Clone `https://github.com/igrejaadcapital/adcapital` (branch `main`)
2. Leia nesta ordem: **[AGENTS.md](./AGENTS.md)** → **[docs/HANDOFF.md](./docs/HANDOFF.md)** → **[ARQUITETURA.md](./ARQUITETURA.md)**
3. Preencha **[docs/CONTA-E-SECRETS.template.md](./docs/CONTA-E-SECRETS.template.md)** offline (senhas não vão no Git)
4. Ambiente local: ver seção abaixo; valide com `pytest` e `npm test`
5. Prompt para IA: *"Leia AGENTS.md, HANDOFF.md e ARQUITETURA.md. Depois: [tarefa]."*

Produção **não depende** de assinatura Cursor — deploy é GitHub → Render.

## Desenvolvimento local

```bash
# Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env   # preencher DATABASE_URL, etc.
python manage.py migrate
python manage.py runserver

# Frontend
cd adcapital-react
npm ci
npm run dev
```

## Testes

```bash
pytest
cd adcapital-react && npm test && npm run lint
```

## Operação (produção)

```bash
python scripts/smoke_producao.py
python manage.py auditar_acesso_lgpd
python fast_backup.py
```

## Deploy

Push na `main` → Render faz deploy de **adcapital-api** e **adcapital-web** (ver `render.yaml`).

Backup diário: GitHub Actions → workflow `Supabase Backup`.
