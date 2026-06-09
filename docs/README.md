# Documentação — AD Capital

Índice dos manuais do repositório `igrejaadcapital/adcapital`.

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
| [OPERACAO-FASE-4.md](./OPERACAO-FASE-4.md) | CI, Sentry, backup GitHub Actions |
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
