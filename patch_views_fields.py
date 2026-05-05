path = 'membros/views.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = "campos_permitidos = ['telefone', 'email', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'cep']"
replacement = "campos_permitidos = ['telefone', 'email', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'cep', 'data_nascimento', 'genero', 'estado_civil', 'naturalidade']"

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Sucesso")
else:
    # Try with single quotes if double quotes fail (though previous view showed single)
    print("Alvo não encontrado")
