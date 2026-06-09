# SSL — `cadastro.adcapitaligreja.com.br` (arquivado)

> **Obsoleto (jun/2026):** o subdomínio foi descontinuado. Use `https://sistema.adcapitaligreja.com.br/#/cadastro`. Ver [DEPRECACAO-CADASTRO-SUBDOMINIO.md](./DEPRECACAO-CADASTRO-SUBDOMINIO.md).

---

Guia histórico para renovar o certificado do subdomínio de **auto-cadastro**.

## Sintoma

Smoke test (`scripts/smoke_producao.py`) falha com:

```
certificate verify failed: certificate has expired
```

Outros hosts (`sistema.`, `api.`) costumam estar OK — o problema é específico do registro DNS `cadastro`.

## Arquitetura DNS

```
Visitante → Cloudflare (proxy laranja) → Render adcapital-web (static site)
```

O certificado que o navegador valida é o **Edge Certificate** do Cloudflare, não o do Render.

## Passo a passo — Cloudflare

Conta: **igrejaadcapital@gmail.com** → [dash.cloudflare.com](https://dash.cloudflare.com)

### 1. Confirmar o registro DNS

1. Zona **adcapitaligreja.com.br** → **DNS** → **Records**.
2. Localize o registro **cadastro** (tipo CNAME ou A).
3. **Proxy status** deve estar **Proxied** (nuvem laranja).
4. Destino típico: hostname do Render (`*.onrender.com` ou custom domain do `adcapital-web`).

### 2. Verificar Universal SSL

1. **SSL/TLS** → **Edge Certificates**.
2. Em **Universal SSL**, status deve ser **Active**.
3. Se **Expired** ou ausente:
   - Clique em **Disable Universal SSL**, aguarde 1–2 min.
   - Clique em **Enable Universal SSL**.
   - Aguarde reemissão (minutos a 24 h).

### 3. Modo SSL (Overview)

1. **SSL/TLS** → **Overview**.
2. Modo recomendado para Render:
   - **Full** — se a origem Render aceitar HTTPS com certificado válido.
   - **Full (strict)** — se o custom domain no Render tiver certificado Let's Encrypt ativo.
3. Evite **Flexible** em produção (criptografia só até o Cloudflare).

### 4. Certificado avançado (se Universal falhar)

1. **SSL/TLS** → **Edge Certificates** → **Order Advanced Certificate**.
2. Hostnames: `cadastro.adcapitaligreja.com.br` (ou `*.adcapitaligreja.com.br`).
3. Aguarde status **Active**.

### 5. Render (origem)

1. [dashboard.render.com](https://dashboard.render.com) → **adcapital-web**.
2. **Settings** → **Custom Domains** → confirme `cadastro.adcapitaligreja.com.br` listado e **Verified**.
3. Se não estiver, adicione o domínio e siga as instruções de DNS do Render.

## Verificação

### PowerShell / terminal

```powershell
curl.exe -vI https://cadastro.adcapitaligreja.com.br/
```

Procure `SSL certificate verify ok` ou status HTTP **200** sem erro de certificado.

### Smoke test completo

```powershell
.\venv\Scripts\python.exe scripts\smoke_producao.py
```

O item `cadastro.adcapitaligreja.com.br carrega` deve passar.

### Navegador

Abra https://cadastro.adcapitaligreja.com.br/ — cadeado verde, formulário de pergunta de segurança do auto-cadastro.

## Propagação

Após reemitir no Cloudflare, pode levar **5–30 minutos** (raro até 24 h). Limpe cache do navegador ou teste em aba anônima.

## Referências no projeto

- URLs: `ARQUITETURA.md`
- Wiki: Configurações → Wiki → alerta SSL
- Smoke: `scripts/smoke_producao.py`
