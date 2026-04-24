import json
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adcapitalapp.settings')
django.setup()

from django.test import Client

c = Client()
data = {
    'nome': 'TESTE MEMBRO',
    'cpf': '12345678912',
    'sync_resposta': 'jesus',
    'email': 'teste@teste.com',
    'funcao': 'Membro',
    'genero': 'M',
    'estado_civil': 'SOLTEIRO',
    'cidade': 'Brasília',
    'uf': 'DF',
    'motivo_entrada': '',
    'unidade': 'Sede'
}
res = c.post('/api/c/', data)
print("STATUS:", res.status_code)
print("CONTENT:", res.content.decode('utf-8'))
