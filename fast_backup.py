import os
import django
import json
from django.core.serializers import serialize

def run_backup():
    # Caminho para as configurações do Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adcapitalcore.settings')
    django.setup()

    from membros.models import Membro, Funcao, Parentesco
    from financeiro.models import Transacao, CategoriaFinanceira
    from agenda.models import Evento, ProgramacaoSemanal

    data = {
        'membros': json.loads(serialize('json', Membro.objects.all())),
        'funcoes': json.loads(serialize('json', Funcao.objects.all())),
        'parentescos': json.loads(serialize('json', Parentesco.objects.all())),
        'transacoes': json.loads(serialize('json', Transacao.objects.all())),
        'categorias_financeiras': json.loads(serialize('json', CategoriaFinanceira.objects.all())),
        'eventos': json.loads(serialize('json', Evento.objects.all())),
        'programacoes': json.loads(serialize('json', ProgramacaoSemanal.objects.all())),
    }

    with open('backup_adcapital.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    print("✅ Backup concluído com sucesso: backup_adcapital.json")

if __name__ == "__main__":
    run_backup()
