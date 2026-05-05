path = 'membros/views.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = "campos_permitidos = ['telefone', 'email', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'cep', 'data_nascimento', 'genero', 'estado_civil', 'naturalidade']"
replacement = "campos_permitidos = ['telefone', 'email', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'cep', 'data_nascimento', 'genero', 'estado_civil', 'naturalidade', 'data_entrada', 'unidade', 'departamento', 'motivo_entrada', 'observacoes']"

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Sucesso")
else:
    print("Alvo não encontrado")
