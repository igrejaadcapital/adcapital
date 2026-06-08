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
| `docs/` | Planos, operação, rollback, mobile |

## Documentação

- [ARQUITETURA.md](./ARQUITETURA.md) — URLs, infra, RBAC, rollback
- [docs/PLANO-REFATORACAO.md](./docs/PLANO-REFATORACAO.md) — Fases 0–4 (concluídas)
- [docs/FASE-5-QUALIDADE.md](./docs/FASE-5-QUALIDADE.md) — Melhorias de qualidade

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

## Deploy

Push na `main` → Render faz deploy de **adcapital-api** e **adcapital-web** (ver `render.yaml`).

Backup diário: GitHub Actions → workflow `Supabase Backup`.
