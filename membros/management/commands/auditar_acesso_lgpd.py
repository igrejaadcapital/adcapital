# -*- coding: utf-8 -*-
"""Lista membros sem login (User/senha) ou sem termo LGPD gerado."""
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from membros.models import Membro, Perfil
from membros.services.acesso_service import cpf_limpo_de_membro


class Command(BaseCommand):
    help = 'Audita membros sem acesso ao portal ou sem PDF do termo LGPD'

    def add_arguments(self, parser):
        parser.add_argument(
            '--todos',
            action='store_true',
            help='Incluir membros DESLIGADO (padrão: só LIGADO)',
        )
        parser.add_argument(
            '--limite',
            type=int,
            default=0,
            help='Máximo de linhas por categoria (0 = todas)',
        )

    def handle(self, *args, **options):
        qs = Membro.objects.all().order_by('nome')
        if not options['todos']:
            qs = qs.filter(status='LIGADO')

        limite = options['limite']
        sem_login = []
        senha_invalida = []
        sem_termo = []
        cpf_invalido = []
        perfil_desvinculado = []

        for m in qs.select_related('funcao'):
            cpf = cpf_limpo_de_membro(m)
            if not cpf:
                cpf_invalido.append(m)
                continue

            user = User.objects.filter(username=cpf).first()
            perfil = Perfil.objects.filter(membro_id=m.id).select_related('user').first()

            if not user:
                sem_login.append(m)
            elif not user.has_usable_password():
                senha_invalida.append((m, user))

            if perfil and perfil.user_id != (user.id if user else None):
                perfil_desvinculado.append((m, perfil, user))
            elif user and (not perfil or perfil.membro_id != m.id):
                perfil_desvinculado.append((m, perfil, user))

            if not m.lgpd_documento:
                sem_termo.append(m)

        total = qs.count()
        self.stdout.write(f'Auditoria — {total} membro(s) analisado(s)\n')

        self._secao('Sem usuário de login (CPF válido, sem User)', sem_login, limite)
        self._secao_senha('Senha não utilizável (User existe, senha não definida)', senha_invalida, limite)
        self._secao_perfil('Perfil ausente ou desvinculado do membro', perfil_desvinculado, limite)
        self._secao('Sem termo LGPD (lgpd_documento vazio)', sem_termo, limite)
        self._secao('CPF inválido ou ausente', cpf_invalido, limite)

        problemas = len(sem_login) + len(senha_invalida) + len(perfil_desvinculado) + len(sem_termo)
        if problemas == 0 and not cpf_invalido:
            self.stdout.write(self.style.SUCCESS('\nNenhuma pendência de acesso ou termo LGPD encontrada.'))
        else:
            self.stdout.write(
                self.style.WARNING(
                    f'\nResumo: {len(sem_login)} sem login, {len(senha_invalida)} senha inválida, '
                    f'{len(perfil_desvinculado)} perfil desvinculado, {len(sem_termo)} sem termo LGPD, '
                    f'{len(cpf_invalido)} CPF inválido.'
                )
            )
            self.stdout.write(
                'Correção: python manage.py gerar_acessos_membros && '
                'python manage.py gerar_termos_lgpd'
            )

    def _linha_membro(self, m):
        cpf = cpf_limpo_de_membro(m) or '—'
        email = m.email or '—'
        return f'  id={m.id} | {m.nome} | CPF {cpf} | {email}'

    def _secao(self, titulo, membros, limite):
        self.stdout.write(f'\n{titulo}: {len(membros)}')
        for m in membros[: limite or None]:
            self.stdout.write(self._linha_membro(m))

    def _secao_senha(self, titulo, items, limite):
        self.stdout.write(f'\n{titulo}: {len(items)}')
        for m, user in items[: limite or None]:
            self.stdout.write(self._linha_membro(m) + f' | user_id={user.id}')

    def _secao_perfil(self, titulo, items, limite):
        self.stdout.write(f'\n{titulo}: {len(items)}')
        for m, perfil, user in items[: limite or None]:
            extra = f'perfil_membro={getattr(perfil, "membro_id", None)} user={getattr(user, "username", None)}'
            self.stdout.write(self._linha_membro(m) + f' | {extra}')
