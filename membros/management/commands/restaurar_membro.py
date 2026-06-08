# -*- coding: utf-8 -*-
"""Restaura um membro excluído a partir de backup_adcapital.json (GitHub Actions / fast_backup)."""
import json
import re

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from membros.models import Funcao, Membro, Parentesco
from membros.services.acesso_service import garantir_acesso_membro
from membros.services.lgpd_service import provisionar_termo_lgpd

FILE_FIELDS = ('foto', 'lgpd_documento')


def cpf_digits(value):
    return ''.join(re.findall(r'\d+', value or ''))


class Command(BaseCommand):
    help = 'Restaura um membro excluído por CPF a partir de backup_adcapital.json'

    def add_arguments(self, parser):
        parser.add_argument('--cpf', required=True, help='CPF do membro (com ou sem máscara)')
        parser.add_argument('--backup', default='backup_adcapital.json', help='Arquivo JSON do backup')
        parser.add_argument('--dry-run', action='store_true', help='Apenas mostra o que seria restaurado')
        parser.add_argument('--sem-termo', action='store_true', help='Não gera termo LGPD se estiver ausente')

    def handle(self, *args, **options):
        cpf = cpf_digits(options['cpf'])
        if len(cpf) != 11:
            raise CommandError('CPF inválido.')

        backup_path = options['backup']
        try:
            with open(backup_path, encoding='utf-8') as f:
                data = json.load(f)
        except FileNotFoundError as exc:
            raise CommandError(
                f'Arquivo não encontrado: {backup_path}. '
                'Baixe o artifact "backup-adcapital-*" em GitHub → Actions → Supabase Backup.'
            ) from exc

        item = next(
            (m for m in data.get('membros', []) if cpf_digits(m.get('fields', {}).get('cpf')) == cpf),
            None,
        )
        if not item:
            raise CommandError(f'CPF {cpf} não encontrado no backup {backup_path}.')

        if Membro.objects.filter(cpf=cpf).exists():
            raise CommandError(f'CPF {cpf} já existe no banco. Nada a restaurar.')

        old_pk = item['pk']
        fields = item['fields'].copy()
        nome = fields.get('nome', cpf)

        parentescos = [
            p for p in data.get('parentescos', [])
            if p['fields'].get('membro_origem') == old_pk or p['fields'].get('membro_destino') == old_pk
        ]

        self.stdout.write(f'Backup: {nome} (id antigo {old_pk}, CPF {cpf})')
        self.stdout.write(f'Parentescos no backup: {len(parentescos)}')

        if options['dry_run']:
            self.stdout.write(self.style.WARNING('Dry-run — nenhuma alteração feita.'))
            return

        with transaction.atomic():
            if fields.get('funcao'):
                Funcao.objects.get_or_create(id=fields['funcao'], defaults={'nome': 'Membro'})
                fields['funcao_id'] = fields.pop('funcao')
            elif 'funcao' in fields:
                fields.pop('funcao')

            for key in FILE_FIELDS:
                if not fields.get(key):
                    fields.pop(key, None)

            membro = Membro.objects.create(**fields)
            self.stdout.write(self.style.SUCCESS(f'Membro criado: id={membro.id}, nome={membro.nome}'))

            restaurados = 0
            for p in parentescos:
                f = p['fields']
                origem_id = f['membro_origem']
                destino_id = f['membro_destino']
                if origem_id == old_pk:
                    origem_id = membro.id
                if destino_id == old_pk:
                    destino_id = membro.id
                if not Membro.objects.filter(pk=origem_id).exists():
                    continue
                if not Membro.objects.filter(pk=destino_id).exists():
                    continue
                Parentesco.objects.get_or_create(
                    membro_origem_id=origem_id,
                    membro_destino_id=destino_id,
                    defaults={'grau': f['grau']},
                )
                restaurados += 1

            user, created = garantir_acesso_membro(membro)
            if user:
                self.stdout.write(
                    f'Acesso: user id={user.id} ({ "criado" if created else "revinculado" })'
                )

            if not options['sem_termo'] and not membro.lgpd_documento:
                if provisionar_termo_lgpd(membro, enviar_email=bool(membro.email)):
                    self.stdout.write('Termo LGPD gerado.')

        self.stdout.write(
            self.style.SUCCESS(
                f'Recuperação concluída para {membro.nome}. Parentescos restaurados: {restaurados}.'
            )
        )
