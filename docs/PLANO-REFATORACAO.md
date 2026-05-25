# Plano de refatoração — AD Capital

Status atualizado após **Fase 1** em produção (maio/2026).

## Visão geral

| Fase | Foco | Status |
|------|------|--------|
| **0** | Segurança (CORS, RBAC, JWT, cron) | Concluída |
| **1** | Backend + API v1 + OpenAPI + Router | Concluída |
| **2** | Front moderno (Query, UX mobile, pastas) | Concluída (core) |
| **3** | Android (PWA + Capacitor) | Em andamento |
| **4** | CI, staging, observabilidade | Backlog |

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
- [ ] **1.3b** Unificar payload parentesco (schema único + testes de contrato)
- [ ] **1.3c** Deprecar `adcapitalapp` no deploy
- [ ] **1.4b** Testes API: login, cadastro público, RBAC financeiro

---

## Fase 2 — Frontend

- [x] **2.1** React Router (feito na Fase 1.4)
- [ ] **2.2** Pastas `features/` + `shared/` (migração gradual)
- [x] **2.3** TanStack Query (cache/retry unificado)
- [x] **2.4** Bottom navigation no portal (mobile)
- [ ] **2.3b** Migrar `useMembros`, `useFinanceiro`, `useDashboard`
- [ ] **2.4b** Inputs mobile (`tel`, máscara CPF)

---

## Fase 3 — Android

- [x] PWA básica (`manifest`, `sw.js`)
- [x] **3.1** Splash/status bar + `viewport-fit` + `start_url` `/login`
- [x] **3.2** Capacitor Android (`android/`, `capacitor.config.json`)
- [x] **3.3** APK instalável modo **live** (abre produção; atualiza com deploy Render, sem loja)
- [ ] **3.3b** APK release assinado para distribuição interna (opcional; Play Store fora de escopo)
- [ ] **3.4** Push (opcional — Firebase)

**Recomendação:** PWA + Capacitor (um código React, mesma API).

---

## Fase 4 — Operação

- [ ] GitHub Actions: `pytest` + `vitest` + `build`
- [ ] Ambiente staging
- [ ] Sentry (front + API)
- [ ] Backup automático Supabase

---

## Rollback

Ver `docs/ROLLBACK-FASE-1.md` e tag `prod-pre-fase1-20260522`.

---

## Ordem sugerida agora

1. Concluir **Fase 2** (Query + UX portal + migrar hooks principais).
2. Iniciar **Fase 3** com Capacitor em branch separada.
3. Fechar pendências **1.3b / 1.4b** em PRs pequenos.
