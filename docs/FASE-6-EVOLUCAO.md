# Fase 6 — Evolução e endurecimento

Continuação do backlog pós-Fase 5 (jun/2026).

## Concluído

- [x] Front 100% em `/api/v1/` (`getApiBaseUrl`, testes atualizados)
- [x] Header `Deprecation` no prefixo legado `/api/`
- [x] Dividir `SettingsPage.jsx` (tabs Wiki + Devocionais + `settingsUi`)
- [x] Dividir `LandingPage.jsx` (Pastoral, Programação, Footer)
- [x] TypeScript gradual: `apiBase.ts`, `queryClient.ts`, `tsconfig.json`
- [x] Comando `auditar_acesso_lgpd` (login + termo LGPD)

## Backlog

- [ ] JWT em cookie httpOnly (substituir `localStorage`)
- [x] Subdomínio `cadastro.adcapitaligreja.com.br` descontinuado — [DEPRECACAO-CADASTRO-SUBDOMINIO.md](./DEPRECACAO-CADASTRO-SUBDOMINIO.md)
- [ ] Remover rotas `/api/` e atalhos `/c/`, `/v/` na raiz (após sunset Dez/2026)
- [ ] TypeScript: migrar `config.js` e services (`membroService`, etc.)
- [ ] Dividir abas restantes de `SettingsPage` (Site, Galeria, Segurança)
- [ ] Cron mensal: `auditar_acesso_lgpd` + alerta se pendências

## Operação recomendada

Após cadastros em lote pelo admin:

```bash
python manage.py auditar_acesso_lgpd
python manage.py gerar_acessos_membros   # se houver sem login
python manage.py gerar_termos_lgpd       # se houver sem PDF
```
