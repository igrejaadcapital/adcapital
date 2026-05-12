import os, django, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adcapitalcore.settings')
django.setup()
from membros.models import ComentarioPalavra
comment = ComentarioPalavra.objects.filter(nome='Sarah Morena Moreira').first()
if comment:
    print(f'TEXTO NO BANCO: {comment.texto}')
else:
    print('Comentário não encontrado')
