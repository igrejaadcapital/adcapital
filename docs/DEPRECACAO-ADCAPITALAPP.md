# Depreciação do app `adcapitalapp` (Fase 1.3c)

O domínio de membros, cadastro e parentesco está no app **`membros`**.

## Status

| Item | Situação |
|------|----------|
| `INSTALLED_APPS` | `adcapitalapp` **não** está listado |
| Imports no código | Nenhum `from adcapitalapp` |
| Deploy (`build.sh`) | Falha se `adcapitalapp` for reativado em settings |
| Pasta `adcapitalapp/` | Mantida só como referência histórica (`LEGACY.md`) |

## Deploy

Não adicione `adcapitalapp` ao Render nem ao `settings.py`. O serviço **adcapital-api** usa apenas:

- `membros`, `financeiro`, `agenda`, `analytics`

## Limpeza futura (opcional)

Após confirmar que não há dependências externas, a pasta `adcapitalapp/` pode ser removida do repositório.
