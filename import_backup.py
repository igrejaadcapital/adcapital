import os
import django
import json
from django.db import transaction
from unittest.mock import patch

def run_import():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adcapitalcore.settings')
    django.setup()

    from membros.models import Membro, Funcao, Parentesco
    from financeiro.models import Transacao, CategoriaFinanceira
    from agenda.models import Evento, ProgramacaoSemanal
    from django.utils.dateparse import parse_datetime

    with open('backup_adcapital.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Patch nos serviços do Google para não tentar sincronizar durante a importação
    with patch('agenda.models.sync_event_to_google', return_value='mock_id'), \
         patch('agenda.models.update_event_to_google', return_value=True):
        
        with transaction.atomic():
            # Funções
            print("Importando Funções...")
            for item in data.get('funcoes', []):
                Funcao.objects.get_or_create(id=item['pk'], defaults=item['fields'])
            
            # Categorias Financeiras
            print("Importando Categorias Financeiras...")
            for item in data.get('categorias_financeiras', []):
                CategoriaFinanceira.objects.get_or_create(id=item['pk'], defaults=item['fields'])

            # Membros
            print("Importando Membros...")
            for item in data.get('membros', []):
                fields = item['fields'].copy()
                if 'funcao' in fields:
                    fields['funcao_id'] = fields.pop('funcao')
                Membro.objects.update_or_create(id=item['pk'], defaults=fields)
            
            # Parentescos
            print("Importando Parentescos...")
            for item in data.get('parentescos', []):
                fields = item['fields']
                Parentesco.objects.get_or_create(
                    membro_origem_id=fields['membro_origem'],
                    membro_destino_id=fields['membro_destino'],
                    defaults={'grau': fields['grau']}
                )

            # Transações
            print("Importando Transações...")
            for item in data.get('transacoes', []):
                Transacao.objects.get_or_create(id=item['pk'], defaults=item['fields'])

            # Eventos
            print("Importando Eventos...")
            for item in data.get('eventos', []):
                fields = item['fields'].copy()
                # Converte strings de data para objetos datetime para o save override não quebrar
                if fields.get('data_inicio'):
                    fields['data_inicio'] = parse_datetime(fields['data_inicio'])
                if fields.get('data_fim'):
                    fields['data_fim'] = parse_datetime(fields['data_fim'])
                
                Evento.objects.get_or_create(id=item['pk'], defaults=fields)

            # Programações Semanais
            print("Importando Programações Semanais...")
            for item in data.get('programacoes', []):
                ProgramacaoSemanal.objects.get_or_create(id=item['pk'], defaults=item['fields'])

    print("✅ Importação concluída com sucesso no novo banco de dados (Supabase)!")

if __name__ == "__main__":
    run_import()
