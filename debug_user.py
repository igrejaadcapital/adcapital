import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adcapitalcore.settings')
django.setup()
from django.contrib.auth.models import User

cpf = '72499877120'
user = User.objects.get(username=cpf)
nova_senha = 'Adcapital' + cpf[:5]
user.set_password(nova_senha)
user.save()
print(f'Senha resetada para {user.username}: {nova_senha}')
# Confirma
print(f'Verificacao: {user.check_password(nova_senha)}')
