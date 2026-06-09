# Plano de refatoração — AD Capital

Status atualizado após **Fases 5–6** (jun/2026). Índice: [README.md](./README.md).

## Visão geral

| Fase | Foco | Status |
|------|------|--------|
| **0** | Segurança (CORS, RBAC, JWT, cron) | Concluída |
| **1** | Backend + API v1 + OpenAPI + Router | Concluída |
| **2** | Front moderno (Query, UX mobile, pastas) | Concluída |
| **3** | Android (PWA + Capacitor) | Concluída |
| **4** | CI, staging, observabilidade | Concluída |
| **5** | Qualidade, LGPD público, limpeza legado | Concluída |
| **6** | Refatoração front, TS gradual, JWT httpOnly | Concluída |

---

## Fase 0 — Segurança

- [x] Remover `api/debug/migrate/`
- [x] CORS restrito + Capacitor localhost
- [x] RBAC financeiro / membros / analytics
- [x] JWT 30 min + refresh 7d + blacklist
- [x] Rate limit login/cadastro/reset
- [x] `CRON_SECRET` no cron de aniversários

---

## Fase 1 — Backend e contrato API

- [x] **1.1** Modularizar `membros` (`api/`, `services/`)
- [x] **1.2** Prefixo `/api/v1/` + legado `/api/`
- [x] **1.3** OpenAPI (`drf-spectacular`, `/api/v1/docs/`)
- [x] **1.4** React Router (rotas `/admin/*`, `/portal/*`)
- [x] **1.3b** Unificar payload parentesco (schema único + testes de contrato)
- [x] **1.3c** Deprecar `adcapitalapp` no deploy
- [x] **1.4b** Testes API: login, cadastro público, RBAC financeiro

---

## Fase 2 — Frontend

- [x] **2.1** React Router (feito na Fase 1.4)
- [x] **2.2** Pastas `features/` + `shared/` (migração gradual)
- [x] **2.3** TanStack Query (cache/retry unificado)
- [x] **2.4** Bottom navigation no portal (mobile)
- [x] **2.3b** Migrar `useMembros`, `useFinanceiro`, `useDashboard` (TanStack Query)
- [x] **2.4b** Inputs mobile (`tel`, máscara CPF)

---

## Fase 3 — Android

- [x] PWA básica (`manifest`, `sw.js`)
- [x] **3.1** Splash/status bar + `viewport-fit` + `start_url` `/login`
- [x] **3.2** Capacitor Android (`android/`, `capacitor.config.json`)
- [x] **3.3** APK instalável modo **live** (abre produção; atualiza com deploy Render, sem loja)
- [x] **3.3b** APK release assinado para distribuição interna (CI + script local + keystore persistente)
- [~] **3.4** Push (Firebase) — **fora de escopo v1** (sem Play Store; ver `docs/MOBILE-ANDROID.md`)

**Recomendação:** PWA + Capacitor (um código React, mesma API).

---

## Fase 4 — Operação

- [x] GitHub Actions: `pytest` + `vitest` + `build` (`.github/workflows/ci.yml`)
- [x] Ambiente staging (`render.staging.yaml`, `DJANGO_ENV=staging`, `docs/STAGING.md`)
- [x] Sentry (front + API, opcional via `SENTRY_DSN` / `VITE_SENTRY_DSN`)
- [x] Backup automático Supabase (`.github/workflows/backup-supabase.yml` + `fast_backup.py`)

Ver [OPERACAO-FASE-4.md](./OPERACAO-FASE-4.md).

---

## Rollback

Ver `docs/ROLLBACK-FASE-1.md` e tag `prod-pre-fase1-20260522`.

---

## Fase 5 — Qualidade (concluída)

Ver [FASE-5-QUALIDADE.md](./FASE-5-QUALIDADE.md).

## Fase 6 — Evolução (concluída)

Ver [FASE-6-EVOLUCAO.md](./FASE-6-EVOLUCAO.md).

## Ordem sugerida agora

1. Manter CI verde (`pytest` + cobertura, `vitest`, `eslint`).
2. Após cadastros em lote: `python manage.py auditar_acesso_lgpd`.
3. iPhone: orientar PWA Safari — [MOBILE-IOS.md](./MOBILE-IOS.md).
4. Dez/2026: remover prefixo legado `/api/`.
