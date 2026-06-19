# Guia para agentes de IA — AD Capital

**Leia isto primeiro** antes de alterar código. Repositório: `igrejaadcapital/adcapital` (branch `main`).

## O que é este projeto

Monorepo da **Igreja AD Capital**: API Django 6 + SPA React 19 + app Android (Capacitor). Produção em Render + Supabase + Cloudflare.

| Pasta | Função |
|-------|--------|
| `adcapitalcore/` | Settings Django, URLs `/api/v1/` |
| `membros/` | Membros, auth JWT, portal, cadastro, LGPD, config |
| `financeiro/` | Transações, categorias, exportação contábil |
| `agenda/` | Eventos |
| `analytics/` | Dashboard interno |
| `adcapital-react/` | Frontend + Capacitor Android |
| `docs/` | Manuais e handoff |
| `scripts/` | Smoke test produção |

**Manual principal:** `ARQUITETURA.md`  
**Avaliação e lacunas:** `docs/HANDOFF.md`  
**Contas (template, sem senhas):** `docs/CONTA-E-SECRETS.template.md`

## Regras antes de codar

1. **API:** clientes novos usam **`/api/v1/`** apenas. Prefixo `/api/` é legado (sunset Dez/2026).
2. **Front produção:** `HashRouter` (`main.jsx`). Dev usa `BrowserRouter`.
3. **Auth:** JWT em **cookies httpOnly** (`credentials: 'include'`). Não voltar a `localStorage` para tokens.
4. **Exclusão de membro:** exige confirmação com **digitação do CPF** (`ConfirmDialog` + `MembrosPage.jsx`).
5. **Commits:** só quando o usuário pedir. Não force push.
6. **Escopo:** diff mínimo; siga convenções existentes (pastas `features/`, services Django em `membros/services/`).
7. **Testes:** rode `pytest` (backend) e `npm test` + `npm run lint` (front) antes de concluir.
8. **Deploy:** push em `main` → Render redeploya API + front automaticamente.

## Comandos essenciais

```powershell
# Backend (Windows)
cd C:\Users\Diego\developer   # ou raiz do clone
.\venv\Scripts\activate
$env:DEBUG='True'             # obrigatório local se SECRET_KEY fraca
python manage.py migrate
python manage.py runserver

# Frontend
cd adcapital-react
npm ci
npm run dev

# Testes
pytest
cd adcapital-react && npm test && npm run lint

# Validar produção pós-deploy
.\venv\Scripts\python.exe scripts\smoke_producao.py
```

## URLs de produção

| URL | Uso |
|-----|-----|
| `https://sistema.adcapitaligreja.com.br` | SPA (login, admin, portal) |
| `https://sistema.adcapitaligreja.com.br/#/cadastro` | Auto-cadastro (quando portal ativo) |
| `https://api.adcapitaligreja.com.br/api/v1/` | API REST |
| `https://api.adcapitaligreja.com.br/api/v1/docs/` | Swagger |

## RBAC (papéis)

| Papel | Acesso |
|-------|--------|
| ADMIN | Tudo |
| SECRETARIO | Membros, agenda, config (não financeiro sensível conforme permissions) |
| TESOUREIRO | Financeiro |
| MEMBRO | Portal do membro |

Permissões: `membros/permissions.py`.

## Auth (Fase 6)

| Endpoint | Função |
|----------|--------|
| `POST /api/v1/token/` | Login — seta cookies `adcapital_access`, `adcapital_refresh` |
| `POST /api/v1/token/refresh/` | Renova access (cookie ou body) |
| `GET /api/v1/auth/me/` | Sessão atual |
| `POST /api/v1/auth/logout/` | Limpa cookies |
| `python manage.py derrubar_sessoes` | Revoga **todos** os logins |

Código: `membros/api/auth.py`, `membros/api/jwt_cookies.py`, `membros/api/cookie_auth.py`, `adcapital-react/src/features/auth/AuthProvider.jsx`, `adcapital-react/src/api/config.ts`.

## Operação recorrente

```bash
python manage.py auditar_acesso_lgpd          # após cadastros em lote
python manage.py gerar_acessos_membros        # se sem login
python manage.py gerar_termos_lgpd              # se sem PDF LGPD
python manage.py restaurar_membro --cpf ...     # membro excluído por engano
python manage.py derrubar_sessoes               # forçar relogin geral
python fast_backup.py                           # backup JSON local
```

GitHub Actions: CI (push), backup Supabase (diário), auditoria LGPD (mensal), APK Android (push em `adcapital-react/`).

## Mobile

| Plataforma | Status |
|------------|--------|
| Android | APK Capacitor — `docs/MOBILE-ANDROID.md` |
| iPhone | **Sem app nativo** — PWA Safari; `docs/MOBILE-IOS.md` |

## Backlog pós-handoff (não bloqueia produção)

1. Remover `/api/` legado e atalhos `/c/`, `/v/` — **Dez/2026**
2. TypeScript: migrar `financeiroService.js`, `configuracaoService.js`, `analyticsService.js`, `internalAnalytics.js`
3. App iOS nativo (Mac + Apple Developer)
4. Push Firebase (fora de escopo v1)
5. `render.yaml` incluir serviço API (hoje só front; API manual no Dashboard)

## Arquivos que mudam com frequência

```
membros/api/                    # endpoints
membros/models.py               # domínio
adcapital-react/src/features/   # telas
adcapital-react/src/routes/     # rotas e guards
adcapitalcore/settings.py       # env, CORS, JWT
```

## O que NÃO fazer

- Reativar app `adcapitalapp/` (removido Fase 5)
- Subdomínio `cadastro.*` (descontinuado — ver `docs/DEPRECACAO-CADASTRO-SUBDOMINIO.md`)
- Commitar `.env`, keystore, ou secrets
- Usar `git push --force` em `main`
- Ignorar `ConfirmDialog` em exclusões destrutivas (membros, financeiro, agenda já usam)

## Documentação por tema

| Tema | Arquivo |
|------|---------|
| Infra completa | `ARQUITETURA.md` |
| Roadmap fases 0–6 | `docs/PLANO-REFATORACAO.md` |
| Deploy API Render | `docs/DEPLOY-API-RENDER.md` |
| Staging | `docs/STAGING.md` |
| Rollback | `docs/ROLLBACK-FASE-1.md` |
| Contrato parentesco | `docs/PARENTESCO-CONTRATO.md` |
| Wiki no sistema | Configurações → aba Wiki (espelha arquitetura) |

*Atualizado jun/2026 — handoff para continuidade sem assinatura Cursor.*
