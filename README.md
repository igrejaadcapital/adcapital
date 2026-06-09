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
| [docs/DEPRECACAO-CADASTRO-SUBDOMINIO.md](./docs/DEPRECACAO-CADASTRO-SUBDOMINIO.md) | Auto-cadastro em `sistema/#/cadastro` (subdomínio legado removido) |

Wiki no sistema: **Configurações → aba Wiki** (espelha a arquitetura + alertas operacionais).

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
