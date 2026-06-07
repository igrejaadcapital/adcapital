# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand

from membros.models import Membro
from membros.services.lgpd_service import provisionar_termo_lgpd


class Command(BaseCommand):
    help = 'Gera PDFs do Termo LGPD para membros que ainda não possuem documento'

    def add_arguments(self, parser):
        parser.add_argument(
            '--enviar-email',
            action='store_true',
            help='Envia o termo por e-mail quando o membro tiver e-mail cadastrado',
        )

    def handle(self, *args, **options):
        enviar_email = options['enviar_email']
        gerados = 0
        pulados = 0

        for m in Membro.objects.all().order_by('nome'):
            if m.lgpd_documento:
                pulados += 1
                continue
            if not m.cpf:
                self.stdout.write(self.style.WARNING(f'{m.nome}: sem CPF, pulando.'))
                pulados += 1
                continue
            if provisionar_termo_lgpd(m, enviar_email=enviar_email):
                gerados += 1
                self.stdout.write(f'  OK: {m.nome}')
            else:
                pulados += 1

        self.stdout.write(
            self.style.SUCCESS(f'Concluído! Termos gerados: {gerados}. Pulados: {pulados}.')
        )
