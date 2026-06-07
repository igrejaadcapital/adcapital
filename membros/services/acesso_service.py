"""Provisionamento de User/Perfil para acesso ao portal."""
import re

from django.contrib.auth.models import User

from membros.models import Perfil


def senha_padrao(cpf_limpo: str) -> str:
    return f'Adcapital{cpf_limpo[:5]}'


def cpf_limpo_de_membro(membro) -> str | None:
    if not membro.cpf:
        return None
    digits = ''.join(re.findall(r'\d+', membro.cpf))
    return digits if len(digits) >= 5 else None


def garantir_acesso_membro(membro, *, definir_senha_se_novo: bool = True):
    """
    Garante User + Perfil vinculados ao Membro (username = CPF só dígitos).
    Retorna (user, created) ou (None, False) se CPF inválido.
    """
    cpf = cpf_limpo_de_membro(membro)
    if not cpf:
        return None, False

    user, created = User.objects.get_or_create(
        username=cpf,
        defaults={'email': membro.email or '', 'first_name': membro.nome or ''},
    )

    if created and definir_senha_se_novo:
        user.set_password(senha_padrao(cpf))
        user.save()
    else:
        updated = []
        if membro.nome and not user.first_name:
            user.first_name = membro.nome
            updated.append('first_name')
        if membro.email and not user.email:
            user.email = membro.email
            updated.append('email')
        if updated:
            user.save(update_fields=updated)

    perfil, _ = Perfil.objects.get_or_create(user=user)
    perfil.membro = membro
    if perfil.role not in ('ADMIN', 'SECRETARIO', 'TESOUREIRO'):
        perfil.role = 'MEMBRO'
    perfil.save()

    return user, created
