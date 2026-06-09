# -*- coding: utf-8 -*-
"""Derruba todas as sessões JWT (cookies e tokens legados)."""
from django.core.management.base import BaseCommand
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

from membros.services.session_revocation import marcar_revogacao_global


class Command(BaseCommand):
    help = (
        'Revoga todas as sessões JWT: blacklist de refresh tokens + '
        'corte global de access tokens (exige novo login).'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Mostra quantos tokens seriam revogados, sem alterar.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        outstanding = OutstandingToken.objects.count()

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'[dry-run] {outstanding} refresh token(s) na blacklist; '
                    'corte global de access seria aplicado agora.'
                )
            )
            return

        revoked = 0
        for row in OutstandingToken.objects.all().iterator():
            row.blacklist()
            revoked += 1

        ts = marcar_revogacao_global()

        self.stdout.write(
            self.style.SUCCESS(
                f'Sessões derrubadas: {revoked} refresh token(s) na blacklist; '
                f'access tokens emitidos antes de {ts} inválidos.'
            )
        )
        self.stdout.write(
            'Todos os usuários precisam fazer login novamente (web, PWA e app Android).'
        )
