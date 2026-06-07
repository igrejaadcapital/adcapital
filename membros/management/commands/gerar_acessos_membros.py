# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand

from membros.models import Membro
from membros.services.acesso_service import garantir_acesso_membro


class Command(BaseCommand):
    help = 'Gera usuários e senhas automáticas para todos os membros cadastrados'

    def handle(self, *args, **options):
        criados = 0
        vinculados = 0

        membros = Membro.objects.all()
        self.stdout.write(f'Iniciando geração de acessos para {membros.count()} membros...')

        for m in membros:
            user, created = garantir_acesso_membro(m)
            if not user:
                self.stdout.write(self.style.WARNING(f'Membro {m.nome} sem CPF válido. Pulando...'))
                continue
            if created:
                criados += 1
            else:
                vinculados += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Concluído! Usuários criados: {criados}. '
                f'Usuários já existentes/vinculados: {vinculados}.'
            )
        )
