# Fase 6 — Evolução e endurecimento

**Status: concluída** (jun/2026).

## Concluído

- [x] Front 100% em `/api/v1/` (`getApiBaseUrl`, testes atualizados)
- [x] Header `Deprecation` no prefixo legado `/api/`
- [x] Dividir `SettingsPage.jsx` (abas Geral, Site, Programação, Galeria, Segurança, Wiki, Devocionais)
- [x] Dividir `LandingPage.jsx` (Pastoral, Programação, Footer)
- [x] TypeScript: `apiBase.ts`, `queryClient.ts`, `config.ts`, `membroService.ts`
- [x] Comando `auditar_acesso_lgpd` (login + termo LGPD)
- [x] Subdomínio `cadastro.adcapitaligreja.com.br` descontinuado
- [x] JWT em cookies **httpOnly** (`CookieJWTAuthentication`, `/auth/me/`, `/auth/logout/`)
- [x] Confirmação de exclusão de membro com digitação do CPF
- [x] Cron mensal GitHub Actions: `.github/workflows/auditar-lgpd.yml`
- [x] Documentação iOS: [MOBILE-IOS.md](./MOBILE-IOS.md)

## Pós-Fase 6 (agendado)

- [ ] Remover rotas `/api/` e atalhos `/c/`, `/v/` na raiz — **sunset Dez/2026**
- [ ] TypeScript: migrar demais services (`financeiroService`, `configuracaoService`, etc.)
- [ ] App iOS nativo (requer Mac + Apple Developer)
- [ ] Push notifications (Firebase) — fora de escopo v1

## Operação recomendada

Após cadastros em lote pelo admin:

```bash
python manage.py auditar_acesso_lgpd
python manage.py gerar_acessos_membros   # se houver sem login
python manage.py gerar_termos_lgpd       # se houver sem PDF
```
