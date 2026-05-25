# Corrigir 404 em `/portal/perfil`, `/admin/...` (SPA no Render)

## Causa

O React usa **BrowserRouter** (URLs reais como `/portal/perfil`). O Render procura um **arquivo físico** nesse caminho. Sem regra de rewrite, responde **404 Not Found**.

Isso aparece ao:
- Atualizar a página (F5)
- Abrir um link direto
- Voltar do histórico

O **service worker** antigo podia piorar o sintoma; a versão `adcapital-v3` usa rede primeiro em navegação.

## Correção obrigatória no Render (1 minuto)

1. [dashboard.render.com](https://dashboard.render.com) → serviço **adcapital-web** (Static Site)
2. Aba **Redirects / Rewrites**
3. **Add Rule**:

| Campo | Valor |
|-------|--------|
| Source Path | `/*` |
| Destination Path | `/index.html` |
| Action | **Rewrite** (não Redirect) |

4. Salvar → aguardar redeploy (se houver)

## Depois do deploy do código (`sw.js` + `render.yaml`)

1. `git pull` na `main`
2. Aguardar build do **adcapital-web** no Render
3. No navegador: **Ctrl+Shift+R** (hard refresh) ou DevTools → Application → Service Workers → **Unregister**
4. Testar: https://sistema.adcapitaligreja.com.br/portal/perfil → deve carregar o app (não texto "Not Found")

## Verificação rápida

```powershell
curl.exe -sI "https://sistema.adcapitaligreja.com.br/portal/perfil"
```

Deve retornar **200** e `Content-Type: text/html` (não `text/plain` 404).
