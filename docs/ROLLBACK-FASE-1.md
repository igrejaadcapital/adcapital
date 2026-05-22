# Rollback — Fase 1 (produção)

## Ponto de restauração

| Item | Valor |
|------|--------|
| Tag Git | `prod-pre-fase1-20260522` |
| Commit (main anterior) | `def497c` |
| Data | 2026-05-22 |

## Rollback rápido no Render

1. Abra o serviço (**API** e **adcapital-web**).
2. **Manual Deploy** → escolha o commit `def497c` ou a tag `prod-pre-fase1-20260522`.
3. No **adcapital-web**, se o front quebrar após o Router, volte temporariamente:
   - `VITE_API_URL=https://api.adcapitaligreja.com.br/api` (legado; ainda suportado no backend).

## Rollback via Git (reverter merge)

```bash
git checkout main
git pull
git revert -m 1 <SHA_DO_MERGE_COMMIT>   # parent 1 = main antes do PR
git push origin main
```

O Render fará deploy automático da `main` revertida.

## Smoke pós-deploy / pós-rollback

```bash
python scripts/smoke_producao.py
# ou
python manage.py smoke_fase0
```

## O que a Fase 1 não altera

- Sem migrações novas de banco.
- Rotas legado `/api/*` permanecem iguais ao `/api/v1/*`.
- Hashes `#/admin`, `#/cadastro` redirecionam para rotas novas (após deploy do front).
