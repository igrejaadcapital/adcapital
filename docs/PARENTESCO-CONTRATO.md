# Contrato API — parentesco (Fase 1.3b)

## Escrita (`parentescos_novo`)

Enviado em POST/PATCH (admin, portal, auto-cadastro). Aceita **lista** ou **string JSON**.

Cada item:

| Campo | Obrigatório | Notas |
|-------|-------------|-------|
| `grau` | Sim | Ex.: `PAI_MAE`, `CONJUGE`, `FILHO` |
| `parente_id` | Um dos dois | ID do membro parente (preferido no front) |
| `membro_destino` | Um dos dois | Sinônimo de `parente_id` |

Exemplo:

```json
"parentescos_novo": [
  { "parente_id": 42, "grau": "PAI_MAE" }
]
```

Implementação: `membros/contracts/parentesco.py` → `salvar_parentescos()`.

## Leitura (`parentes`)

Retornado em `MembroSerializer` (lista de membros, portal, detalhe):

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | int | ID do vínculo |
| `membro_destino` | int | ID do membro parente |
| `parente_id` | int | Igual a `membro_destino` (alias) |
| `nome_parente` | string | Nome do parente |
| `grau` | string | Grau de parentesco |

## Testes de contrato

- `membros/tests/test_parentesco_contract.py`
- `membros/tests/test_api_contract.py` (cadastro com parentesco)
