# Documentação — AD Capital

Índice dos manuais do repositório `igrejaadcapital/adcapital`.

## Handoff (continuidade sem contexto de chat)

| Documento | Conteúdo |
|-----------|----------|
| [AGENTS.md](../AGENTS.md) | **Guia para IA/dev** — regras, comandos, o que não fazer |
| [HANDOFF.md](./HANDOFF.md) | **Avaliação completa** — lacunas, pronto vs pendente |
| [CONTA-E-SECRETS.template.md](./CONTA-E-SECRETS.template.md) | Template de contas (preencher offline, sem senhas no Git) |
| [DEPLOY-API-RENDER.md](./DEPLOY-API-RENDER.md) | API no Render (fora do render.yaml) |

### Como retornar (resumo)

1. `git clone https://github.com/igrejaadcapital/adcapital.git`
2. Ler **AGENTS.md** → **HANDOFF.md** → **ARQUITETURA.md** (seção *Como retornar*)
3. `copy .env.example .env` + `npm ci` + `pytest` / `npm test`
4. Nova IA: *"Leia AGENTS.md, HANDOFF.md e ARQUITETURA.md. Depois: [tarefa]."*
5. Pós-deploy: `python scripts/smoke_producao.py`

Wiki no sistema: **Configurações → Wiki** (bloco *Como retornar ao projeto* no topo).

## Arquitetura e visão geral

| Documento | Conteúdo |
|-----------|----------|
| [ARQUITETURA.md](../ARQUITETURA.md) | **Manual principal** — URLs, infra, RBAC, MER, backup, fases 0–6 |
| [PLANO-REFATORACAO.md](./PLANO-REFATORACAO.md) | Roadmap por fases (0–6) e status |
| Wiki no sistema | Configurações → aba **Wiki** (espelha `ARQUITETURA.md` + alertas operacionais) |

## Fases recentes

| Documento | Conteúdo |
|-----------|----------|
| [FASE-5-QUALIDADE.md](./FASE-5-QUALIDADE.md) | DRF público, HSTS, ESLint, ConfirmDialog, pytest-cov |
| [FASE-6-EVOLUCAO.md](./FASE-6-EVOLUCAO.md) | Refatoração front, TypeScript, API v1, auditoria LGPD |

## Operação e deploy

| Documento | Conteúdo |
|-----------|----------|
| [ALERTAS-INFRA.md](./ALERTAS-INFRA.md) | E-mail diário: SSL, ping Render/API, vencimentos |
| [STAGING.md](./STAGING.md) | Ambiente staging no Render |
| [DEPLOY-FRONTEND-SPA.md](./DEPLOY-FRONTEND-SPA.md) | SPA, rewrites, HashRouter |
| [DEPRECACAO-CADASTRO-SUBDOMINIO.md](./DEPRECACAO-CADASTRO-SUBDOMINIO.md) | Subdomínio `cadastro.*` descontinuado — URL em `sistema/#/cadastro` |
| [SSL-CADASTRO.md](./SSL-CADASTRO.md) | *(arquivado)* Guia SSL do subdomínio legado |
| [ROLLBACK-FASE-1.md](./ROLLBACK-FASE-1.md) | Rollback de emergência pós-Fase 1 |

## Contratos e legado

| Documento | Conteúdo |
|-----------|----------|
| [PARENTESCO-CONTRATO.md](./PARENTESCO-CONTRATO.md) | Payload unificado de parentesco |
| [DEPRECACAO-ADCAPITALAPP.md](./DEPRECACAO-ADCAPITALAPP.md) | App `adcapitalapp` removido (Fase 5) |

## Mobile

| Documento | Conteúdo |
|-----------|----------|
| [MOBILE-IOS.md](./MOBILE-IOS.md) | iPhone — PWA Safari (sem App Store hoje) |
| [MOBILE-ANDROID.md](./MOBILE-ANDROID.md) | Capacitor, APK, PWA |

## Comandos úteis (produção / local)

```bash
# Validar deploy
python scripts/smoke_producao.py
python manage.py smoke_fase0

# Auditoria login + termo LGPD (após cadastros no admin)
python manage.py auditar_acesso_lgpd

# Corrigir pendências
python manage.py gerar_acessos_membros
python manage.py gerar_termos_lgpd

# Backup manual
python fast_backup.py

# Testes
pytest
cd adcapital-react && npm test && npm run lint
```
