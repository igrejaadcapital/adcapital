import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adcapitalcore.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from membros.views import DevocionalViewSet

factory = APIRequestFactory()
request = factory.post('/api/devocionais/', {
    'titulo': 'Teste',
    'conteudo': 'Teste',
    'autor': 'Pastor'
}, format='json')

view = DevocionalViewSet.as_view({'post': 'create'})
try:
    response = view(request)
    print("Status:", response.status_code)
    print("Data:", response.data)
except Exception as e:
    import traceback
    traceback.print_exc()
