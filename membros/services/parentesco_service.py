"""Regras de negócio para vínculos de parentesco."""
from membros.models import Parentesco


def salvar_parentescos(membro, parentescos_data):
    """
    Substitui os parentescos do membro.
    Aceita parente_id ou membro_destino no payload (contrato unificado Fase 1).
    """
    Parentesco.objects.filter(membro_origem=membro).delete()
    if not parentescos_data:
        return
    for item in parentescos_data:
        p_id = item.get('parente_id') or item.get('membro_destino')
        grau = item.get('grau')
        if p_id and grau and str(p_id) != str(membro.id):
            Parentesco.objects.get_or_create(
                membro_origem=membro,
                membro_destino_id=p_id,
                defaults={'grau': grau},
            )


# Alias legado usado em views antigas
_salvar_parentescos_direto = salvar_parentescos
