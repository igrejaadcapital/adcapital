"""Regras de negócio para vínculos de parentesco."""
from membros.contracts.parentesco import parse_parentescos_novo
from membros.models import Parentesco


def salvar_parentescos(membro, parentescos_data):
    """
    Substitui os parentescos do membro.
    Aceita ``parentescos_novo`` bruto (lista, JSON string ou FormData).
    """
    items = parse_parentescos_novo(parentescos_data)
    Parentesco.objects.filter(membro_origem=membro).delete()
    if not items:
        return
    for item in items:
        p_id = item['membro_destino']
        grau = item['grau']
        if p_id and grau and str(p_id) != str(membro.id):
            Parentesco.objects.get_or_create(
                membro_origem=membro,
                membro_destino_id=p_id,
                defaults={'grau': grau},
            )


_salvar_parentescos_direto = salvar_parentescos
