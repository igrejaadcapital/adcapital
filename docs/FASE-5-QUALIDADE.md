# Fase 5 — Qualidade e consolidação

Melhorias aplicadas após auditoria de código (jun/2026).

## Concluído

- [x] Unificar auto-cadastro público no DRF (`AutoCadastroMembroView` + `verificar_resposta_portal`)
- [x] Remover `membros/view_public.py` (legado `csrf_exempt`)
- [x] Centralizar pós-cadastro em `cadastro_service.finalizar_cadastro_publico`
- [x] Logging estruturado (`LOGGING` em settings + `logging` nos módulos públicos)
- [x] HSTS em produção
- [x] Erros genéricos em endpoints públicos (sem `str(e)`)
- [x] `.gitignore`: `staticfiles/`, `test_media/`, `adcapital-react/.env`
- [x] `README.md` na raiz
- [x] Dependabot (`.github/dependabot.yml`)
- [x] ESLint no CI
- [x] `ConfirmDialog` em exclusões (membros, financeiro, agenda)
- [x] Testes mínimos analytics e financeiro RBAC
- [x] Atualização `ARQUITETURA.md` (HashRouter em produção)

## Backlog (próximas iterações)

- [x] Remover pasta `adcapitalapp/` após revisão final
- [x] Cobertura mínima no CI (`pytest-cov`, limiar 35%)
- [x] Revisar autocomplete público de membros (LGPD — token após verificação)
- [x] `staticfiles/` removido do versionamento Git
- [ ] Dividir `SettingsPage.jsx` e `LandingPage.jsx`
- [ ] TypeScript gradual em `api/` e hooks
- [ ] Retirar prefixo legado `/api/` quando todos os clientes usarem `/api/v1/`
