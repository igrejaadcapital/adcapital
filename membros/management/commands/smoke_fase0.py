"""
Verificação pós-Fase 0: banco local/remoto + API de produção.

Uso:
  python manage.py smoke_fase0
  python manage.py smoke_fase0 --api-only
"""
import os
import subprocess
import sys
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Executa checklist da Fase 0 (tabelas JWT + smoke HTTP em produção).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--api-only',
            action='store_true',
            help='Pula checagem de tabelas no banco configurado em DATABASE_URL.',
        )

    def handle(self, *args, **options):
        ok = True

        if not options['api_only']:
            ok = self._check_token_blacklist() and ok

        ok = self._run_http_smoke() == 0 and ok

        if not ok:
            self.stderr.write(self.style.ERROR('Smoke Fase 0: falhou — veja itens acima.'))
            sys.exit(1)
        self.stdout.write(self.style.SUCCESS('Smoke Fase 0: tudo OK.'))

    def _check_token_blacklist(self):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT tablename FROM pg_tables "
                "WHERE schemaname = 'public' AND tablename LIKE 'token_blacklist%%'"
            )
            tables = [row[0] for row in cursor.fetchall()]

        expected = {'token_blacklist_blacklistedtoken', 'token_blacklist_outstandingtoken'}
        missing = expected - set(tables)
        if missing:
            self.stderr.write(
                self.style.ERROR(f'Tabelas token_blacklist ausentes: {sorted(missing)}')
            )
            return False

        self.stdout.write(self.style.SUCCESS(f'token_blacklist OK ({len(tables)} tabelas)'))
        return True

    def _run_http_smoke(self):
        root = Path(__file__).resolve().parents[3]
        script = root / 'scripts' / 'smoke_producao.py'
        if not script.exists():
            self.stderr.write(self.style.WARNING(f'Script não encontrado: {script}'))
            return 1

        env = os.environ.copy()
        result = subprocess.run(
            [sys.executable, str(script)],
            cwd=str(root),
            env=env,
        )
        return result.returncode
