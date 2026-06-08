# SSL — `cadastro.adcapitaligreja.com.br`

## Sintoma

Smoke test (`scripts/smoke_producao.py`) falha com:

```
certificate verify failed: certificate has expired
```

O subdomínio passa pelo **Cloudflare** (proxy) e aponta para o serviço estático **Render** (`adcapital-web` ou site dedicado de cadastro).

## Correção (Cloudflare)

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com) → zona `adcapitaligreja.com.br`.
2. **SSL/TLS** → **Edge Certificates** → confirme que **Universal SSL** está **Active**.
3. Se expirado, use **Order Advanced Certificate** ou **Disable Universal → Re-enable** para forçar reemissão (aguarde até 24 h).
4. **SSL/TLS** → **Overview** → modo recomendado: **Full (strict)** se a origem Render tiver certificado válido; **Full** se a origem só aceitar HTTP internamente.
5. **DNS** → registro `cadastro` → proxy laranja (proxied) ativo.

## Verificação

```bash
curl.exe -vI https://cadastro.adcapitaligreja.com.br/
python scripts/smoke_producao.py
```

Após renovação, o item `cadastro.adcapitaligreja.com.br carrega` deve passar.

## Nota

A API (`api.adcapitaligreja.com.br`) e o sistema admin (`sistema.adcapitaligreja.com.br`) não são afetados — apenas o host de auto-cadastro.
