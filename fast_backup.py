import json
import os
import sys

import django
from django.core.serializers import serialize


def run_backup():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adcapitalcore.settings')
    django.setup()

    from agenda.models import Evento, ProgramacaoSemanal
    from analytics.models import Acesso
    from financeiro.models import CategoriaFinanceira, Transacao
    from membros.models import Funcao, Membro, Parentesco

    data = {
        'membros': json.loads(serialize('json', Membro.objects.all())),
        'funcoes': json.loads(serialize('json', Funcao.objects.all())),
        'parentescos': json.loads(serialize('json', Parentesco.objects.all())),
        'transacoes': json.loads(serialize('json', Transacao.objects.all())),
        'categorias_financeiras': json.loads(serialize('json', CategoriaFinanceira.objects.all())),
        'eventos': json.loads(serialize('json', Evento.objects.all())),
        'programacoes': json.loads(serialize('json', ProgramacaoSemanal.objects.all())),
        'acessos': json.loads(serialize('json', Acesso.objects.all())),
    }

    out_path = os.environ.get('BACKUP_OUTPUT', 'backup_adcapital.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    counts = {k: len(v) for k, v in data.items()}
    print(f'Backup concluido: {out_path}')
    print(counts)
    return out_path


if __name__ == '__main__':
    try:
        run_backup()
    except Exception as exc:
        print(f'ERRO no backup: {exc}', file=sys.stderr)
        sys.exit(1)
