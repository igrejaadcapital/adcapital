import os
path = 'membros/views.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
# Search for the specific line without using complex quotes in the script itself if possible
target_line = "return Response({'error': 'Perfil de membro não encontrado.'}, status=404)"
replacement_line = "return Response({'error': f'Perfil de membro não encontrado para: {request.user.username}'}, status=404)"
if target_line in content:
    content = content.replace(target_line, replacement_line)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Sucesso')
else:
    print('Alvo não encontrado')
