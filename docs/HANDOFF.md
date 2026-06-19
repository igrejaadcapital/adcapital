# Handoff — Avaliação completa do projeto AD Capital

Documento para **qualquer desenvolvedor ou IA** retomar o projeto sem depender de contexto de conversas anteriores.  
**Data:** jun/2026 · **Repo:** `igrejaadcapital/adcapital` · **Produção:** operacional.

---

## 1. Resumo executivo

| Aspecto | Avaliação |
|---------|-----------|
| **Pronto para produção?** | **Sim** — sistema em uso (membros, financeiro, agenda, portal, site, Android) |
| **Roadmap fases 0–6** | **Concluído** (exc. itens opcionais pós-Fase 6) |
| **Documentação** | **Boa** — `ARQUITETURA.md`, fases, mobile, deprecações |
| **Testes / CI** | **Adequado** — pytest 35%+ cobertura, vitest, lint, build no GitHub Actions |
| **Handoff para nova IA** | **Este doc + `AGENTS.md`** — leia os dois antes de codar |
| **Principal lacuna** | Infra-as-code incompleta (API Render manual), TypeScript parcial, sem app iOS |

**Conclusão:** o projeto **não está “incompleto” para operar a igreja**. Está **aquém** apenas de refinamentos (TS total, App Store, remoção legado `/api/`, documentação de contas centralizada). Para **novas construções**, uma IA com assinatura futura consegue assumir se ler `AGENTS.md`, `ARQUITETURA.md` e esta avaliação.

---

## 2. O que está pronto (não reimplementar)

### Backend
- Django 6 + DRF, PostgreSQL (Supabase)
- API versionada `/api/v1/` + OpenAPI (`/docs/`)
- JWT cookies httpOnly + refresh + blacklist + `derrubar_sessoes`
- RBAC (ADMIN, SECRETARIO, TESOUREIRO, MEMBRO)
- Rate limit login/cadastro/portal
- Auto-cadastro DRF (`/api/v1/c/`, `/api/v1/v/`)
- LGPD: termo PDF, autocomplete com `portal_token`, `auditar_acesso_lgpd`
- Backup JSON (`fast_backup.py`) + GitHub Actions diário
- Cron aniversários (`CRON_SECRET`) + keep-alive documentado

### Frontend
- React 19, Vite, TanStack Query, Tailwind 4
- React Router 7, guards por papel
- Settings modular (Geral, Site, Galeria, Segurança, Wiki, Devocionais)
- ConfirmDialog em exclusões (membro exige CPF)
- HashRouter em produção (Render static)

### Mobile & PWA
- Android APK (Capacitor live → atualiza com deploy)
- PWA + instruções iPhone (`MOBILE-IOS.md`)

### Operação
- Smoke test: `scripts/smoke_producao.py`
- CI, backup, auditoria LGPD mensal, APK workflow
- Staging blueprint: `render.staging.yaml`

---

## 3. O que está aquém (lacunas reais)

### 3.1 Crítico para quem mantém infra (não para usuários finais)

| Lacuna | Impacto | Onde resolver |
|--------|---------|---------------|
| **`render.yaml` só tem o front** | Quem recria Render do zero não recria a API automaticamente | `docs/DEPLOY-API-RENDER.md` (criado no handoff) |
| **Contas/senhas espalhadas** | Render, Cloudflare, Supabase, cron-job.org, GitHub Secrets | Preencher `docs/CONTA-E-SECRETS.template.md` **offline** (não commitar senhas) |
| **Wiki JSX vs `ARQUITETURA.md`** | Podem divergir com o tempo | Atualizar ambos ao mudar infra |

### 3.2 Desenvolvimento (dívida técnica planejada)

| Lacuna | Prioridade | Notas |
|--------|------------|-------|
| **TypeScript parcial** | Média | Feito: `apiBase.ts`, `queryClient.ts`, `config.ts`, `membroService.ts`. Falta: `financeiroService.js`, `configuracaoService.js`, `analyticsService.js`, `internalAnalytics.js` |
| **API legado `/api/`** | Baixa até Dez/2026 | Middleware `Deprecation`; front já usa `/api/v1/` |
| **Atalhos `/c/`, `/v/` na raiz** | Baixa | Links históricos; remover com legado |
| **Cobertura front** | Média | 6 arquivos vitest; sem gate de cobertura |
| **Cobertura back 35%** | Baixa | Suficiente para CI; margem para regressão |

### 3.3 Produto / plataforma (fora de escopo v1)

| Lacuna | Alternativa atual |
|--------|-------------------|
| **App iOS nativo** | Safari → Adicionar à Tela de Início |
| **Push notifications** | Não implementado |
| **Subdomínio cadastro** | Descontinuado → `sistema/#/cadastro` |

---

## 4. Estado das fases (roadmap)

| Fase | Status |
|------|--------|
| 0 Segurança | Concluída |
| 1 API v1 + OpenAPI + Router | Concluída |
| 2 Front moderno (Query, features/) | Concluída |
| 3 Android Capacitor | Concluída (push = fora de escopo) |
| 4 CI, staging, Sentry, backup | Concluída |
| 5 Qualidade, LGPD, limpeza legado | Concluída |
| 6 Evolução (JWT httpOnly, Settings split, TS inicial) | **Concluída** |

Detalhe Fase 6: `docs/FASE-6-EVOLUCAO.md`.

---

## 5. Mapa mental da arquitetura

```
Visitante → Cloudflare → Render adcapital-web (React SPA)
                              ↓ credentials + cookies
                         Render adcapital-api (Django)
                              ↓ DATABASE_URL
                         Supabase PostgreSQL
                              ↓ fotos
                         Cloudinary
```

**Login:** `POST api.../token/` → cookies httpOnly → `GET auth/me/` valida sessão.

**Deploy:** push `main` → GitHub → Render auto-deploy (API + web).

---

## 6. Variáveis de ambiente (referência)

Ver `.env.example` (API) e `adcapital-react/.env.example` (front).

| Variável | Onde | Obrigatória prod |
|----------|------|------------------|
| `SECRET_KEY` | API | Sim |
| `DATABASE_URL` | API | Sim |
| `CRON_SECRET` | API | Sim (cron aniversários) |
| Cloudinary trio | API | Sim (fotos) |
| `VITE_API_URL` | Build front | Sim (`.../api/v1`) |
| `JWT_COOKIE_DOMAIN` | API | Default `.adcapitaligreja.com.br` |
| `SENTRY_*` | API/front | Opcional |

---

## 7. Comandos de emergência

| Situação | Comando |
|----------|---------|
| Validar produção | `python scripts/smoke_producao.py` |
| Membro excluído por engano | `python manage.py restaurar_membro --cpf XXXXXXXXXXX` |
| Forçar todos a logar de novo | `python manage.py derrubar_sessoes` |
| Membros sem acesso/LGPD | `python manage.py auditar_acesso_lgpd` |
| Restaurar backup | `python import_backup.py` + `python repair_db.py` |
| Rollback Git extremo | Tag `prod-pre-fase1-20260522` — ver `docs/ROLLBACK-FASE-1.md` |

---

## 8. Roteiro para a próxima IA (ordem sugerida)

> **Espelho em:** `ARQUITETURA.md` (seção *Como retornar*), `README.md`, Wiki **Configurações → Wiki** (topo).

1. Ler **`AGENTS.md`** (regras) e **`ARQUITETURA.md`** (infra).
2. Clonar, `cp .env.example .env`, `npm ci`, `pytest`, `npm test`.
3. Preencher **`docs/CONTA-E-SECRETS.template.md`** offline com titular da igreja.
4. Antes de feature nova: grep `/api/` no front — só `/api/v1/`.
5. Após deploy: `smoke_producao.py`.
6. **Dez/2026:** executar runbook remoção `/api/` legado (seção 9).

**Prompt pronto:** *"Leia AGENTS.md, docs/HANDOFF.md e ARQUITETURA.md. Depois execute: [tarefa]."*

---

## 9. Runbook — remoção API legado (Dez/2026)

1. Grep no repo: `'/api/'` sem `v1` no front — deve ser zero.
2. Remover em `adcapitalcore/urls.py`: `path('api/', ...)`, atalhos `c/`, `v/`.
3. Remover ou simplificar `LegacyApiDeprecationMiddleware`.
4. Atualizar smoke test se ainda testar legado.
5. Deploy + smoke + avisar integrações externas (se houver).

---

## 10. Runbook — migrar service JS → TS

Ordem sugerida:

1. `financeiroService.js`
2. `configuracaoService.js`
3. `analyticsService.js`
4. `internalAnalytics.js`

Padrão: copiar de `membroService.ts`; importar de `./config` (já TS).

---

## 11. Checklist “projeto pronto para pausar assinatura”

- [x] Produção estável documentada
- [x] `AGENTS.md` para onboarding de IA
- [x] `HANDOFF.md` (este arquivo)
- [x] Template de contas sem secrets no Git
- [x] Deploy API documentado (`DEPLOY-API-RENDER.md`)
- [x] Fases 0–6 marcadas concluídas de forma consistente
- [ ] **Titular preenche `CONTA-E-SECRETS` offline** (ação humana)
- [ ] Comunicar igreja: iPhone = PWA Safari; Android = APK

---

## 12. Contatos e titularidade (preencher offline)

Não commitar senhas. Use `docs/CONTA-E-SECRETS.template.md`.

| Serviço | Titular sugerido |
|---------|------------------|
| GitHub repo | igrejaadcapital |
| Render | conta igreja |
| Cloudflare | igrejaadcapital@gmail.com (ver ARQUITETURA) |
| Supabase | projeto AD Capital |
| Domínio | Registro.br |

---

*Este handoff substitui contexto de chat. Qualquer IA ou dev deve tratar este repositório como fonte da verdade.*
