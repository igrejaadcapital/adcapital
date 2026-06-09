# Descontinuação — `cadastro.adcapitaligreja.com.br`

**Status:** descontinuado em jun/2026 (onda de cadastro encerrada).

## URL oficial do auto-cadastro

```
https://sistema.adcapitaligreja.com.br/#/cadastro
```

A rota React `/cadastro`, a API pública (`/api/v1/c/`, `/api/v1/v/`) e o toggle no admin (**Configurações → Portal**) permanecem ativos.

## O que foi removido do código

- `cadastro.adcapitaligreja.com.br` em `ALLOWED_HOSTS`, CORS e CSRF (`adcapitalcore/settings.py`)
- Entrada em `allowNavigation` dos `capacitor.config*.json`
- Smoke test e checklist SSL específicos do subdomínio

## Infraestrutura (manual)

1. **Cloudflare** — remover ou redirecionar o registro DNS `cadastro` (CNAME/A) na zona `adcapitaligreja.com.br`.
2. **Render** — o serviço `adcapital-web` não listava `cadastro` como custom domain (limite Hobby 2/2: `sistema` + `api`). Nenhuma ação no Render.

## Histórico SSL

O subdomínio apresentava certificado expirado na borda Cloudflare. Em vez de renovar SSL e adicionar um 3º custom domain no Render, o subdomínio foi abandonado. O guia antigo permanece arquivado em [SSL-CADASTRO.md](./SSL-CADASTRO.md) (somente referência histórica).
