path = 'membros/urls.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
old = "path('meus-dados/', MeusDadosView.as_view(), name='meus-dados'),"
new = "path('membros/meus-dados/', MeusDadosView.as_view(), name='meus-dados'),"
content = content.replace(old, new)

# Cleanup duplicate router include
if content.count("path('', include(router.urls)),") > 1:
    content = content.replace("path('', include(router.urls)),", "", 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
