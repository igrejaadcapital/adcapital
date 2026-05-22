# App legado — não usar em código novo

O domínio de membros, parentesco e cadastro foi consolidado no app **`membros`**.

- Este app **não** está em `INSTALLED_APPS`.
- Não criar models, views ou migrações aqui.
- Pode ser removido em uma limpeza futura após confirmar que não há referências externas.
