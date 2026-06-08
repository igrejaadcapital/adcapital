# Depreciação do app `adcapitalapp` (Fase 1.3c → removido Fase 5)

O domínio de membros, cadastro e parentesco está no app **`membros`**.

## Status (jun/2026)

| Item | Situação |
|------|----------|
| `INSTALLED_APPS` | `adcapitalapp` **não** está listado |
| Imports no código | Nenhum `from adcapitalapp` |
| Deploy (`build.sh`) | Falha se `adcapitalapp` for reativado em settings |
| Pasta `adcapitalapp/` | **Removida** do repositório (commit Fase 5) |
| `membros/view_public.py` | **Removido** — cadastro público no DRF |

## Deploy

Não reative `adcapitalapp`. O serviço **adcapital-api** usa apenas:

- `membros`, `financeiro`, `agenda`, `analytics`
