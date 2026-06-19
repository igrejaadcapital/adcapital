# -*- coding: utf-8 -*-
"""Alertas por e-mail: SSL, disponibilidade e vencimentos de serviços."""
from django.core.management.base import BaseCommand

from membros.services.infra_alerts_service import (
    destinatarios_alertas,
    formatar_relatorio_texto,
    gerar_relatorio,
)
from membros.utils import enviar_email_resend_api


class Command(BaseCommand):
    help = (
        'Verifica SSL, ping dos serviços (Render, API, front) e vencimentos '
        'cadastrados; envia e-mail via Resend se houver aviso/crítico.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Só imprime o relatório, não envia e-mail.',
        )
        parser.add_argument(
            '--sempre-enviar',
            action='store_true',
            help='Envia relatório mesmo se tudo OK (útil para teste semanal).',
        )
        parser.add_argument(
            '--com-banco',
            action='store_true',
            help='Inclui teste de conexão PostgreSQL (DATABASE_URL).',
        )
        parser.add_argument(
            '--dias-ssl-aviso',
            type=int,
            default=30,
            help='Dias antes do vencimento SSL para AVISO (padrão 30).',
        )
        parser.add_argument(
            '--semanal',
            action='store_true',
            help='Segundas-feiras envia relatório completo mesmo se tudo OK.',
        )

    def handle(self, *args, **options):
        import datetime

        if options['semanal'] and datetime.date.today().weekday() == 0:
            options['sempre_enviar'] = True

        rel = gerar_relatorio(
            incluir_banco=options['com_banco'],
            dias_aviso_ssl=options.get('dias_ssl_aviso', 30),
        )
        texto = formatar_relatorio_texto(rel)
        self.stdout.write(texto)

        if options['dry_run']:
            self.stdout.write(self.style.WARNING('[dry-run] E-mail não enviado.'))
            return

        if not rel.tem_problema and not options['sempre_enviar']:
            self.stdout.write(self.style.SUCCESS('Nenhum alerta — e-mail omitido (use --sempre-enviar para relatório completo).'))
            return

        assunto = '[AD Capital] '
        if rel.tem_critico:
            assunto += 'CRÍTICO — serviço ou SSL com problema'
        elif rel.tem_problema:
            assunto += 'Aviso — renovação ou SSL próximo do vencimento'
        else:
            assunto += 'Relatório semanal — infra OK'

        destinos = destinatarios_alertas()
        if not destinos:
            self.stderr.write(self.style.ERROR('ALERTAS_EMAIL_PARA vazio.'))
            return

        ok_count = 0
        for email in destinos:
            if enviar_email_resend_api(email, assunto, texto):
                ok_count += 1
                self.stdout.write(self.style.SUCCESS(f'E-mail enviado para {email}'))
            else:
                self.stderr.write(self.style.ERROR(f'Falha ao enviar para {email}'))

        if ok_count == 0:
            self.stderr.write(self.style.ERROR('Nenhum e-mail enviado. Verifique RESEND_API_KEY no Render ou .env.'))
