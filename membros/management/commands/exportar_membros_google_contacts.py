# -*- coding: utf-8 -*-
from csv import DictWriter
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from membros.models import Membro

CSV_FIELDS = [
    'First Name',
    'Middle Name',
    'Last Name',
    'Phonetic First Name',
    'Phonetic Middle Name',
    'Phonetic Last Name',
    'Name Prefix',
    'Name Suffix',
    'Nickname',
    'File As',
    'Organization Name',
    'Organization Title',
    'Organization Department',
    'Birthday',
    'Notes',
    'Photo',
    'Labels',
    'E-mail 1 - Label',
    'E-mail 1 - Value',
    'Phone 1 - Label',
    'Phone 1 - Value',
]


def split_name(full_name):
    """Retorna (first, middle, last) a partir do nome completo.

    Ex: 'ALICE LINHARES XAVIER DE COUTO' -> ('ALICE', 'LINHARES XAVIER', 'DE COUTO')
    """
    if not full_name:
        return '', '', ''
    parts = full_name.strip().split()
    if len(parts) == 1:
        return parts[0], '', ''
    if len(parts) == 2:
        return parts[0], '', parts[1]
    first = parts[0]
    last = parts[-1]
    middle = ' '.join(parts[1:-1])
    return first, middle, last


class Command(BaseCommand):
    help = 'Exporta membros para CSV compatível com importação manual no Google Contacts.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            '-o',
            type=str,
            default='',
            help='Caminho do arquivo de saída .csv (padrão: relatorios/membros_google_contacts_YYYYMMDD_HHMMSS.csv).',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Exporta todos os membros, incluindo aqueles com status não ativo.',
        )
        parser.add_argument(
            '--status',
            type=str,
            default='',
            help='Filtra por status específico (ex: LIGADO). Ignorado quando --all é usado.',
        )

    def handle(self, *args, **options):
        membros = Membro.objects.all().order_by('nome')
        if not options['all']:
            status = options.get('status') or 'LIGADO'
            membros = membros.filter(status=status)

        if not membros.exists():
            self.stdout.write(self.style.WARNING('Nenhum membro encontrado para exportar.'))
            return

        output_path = options.get('output') or ''
        if not output_path:
            timestamp = timezone.localtime().strftime('%Y%m%d_%H%M%S')
            rel_dir = Path(settings.BASE_DIR) / 'relatorios'
            rel_dir.mkdir(parents=True, exist_ok=True)
            output_path = rel_dir / f'membros_google_contacts_{timestamp}.csv'
        else:
            output_path = Path(output_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)

        with output_path.open('w', encoding='utf-8-sig', newline='') as csvfile:
            writer = DictWriter(csvfile, fieldnames=CSV_FIELDS)
            writer.writeheader()

            for membro in membros:
                first, middle, last = split_name(membro.nome)
                row = {
                    'First Name': first,
                    'Middle Name': middle,
                    'Last Name': last,
                    'Phonetic First Name': '',
                    'Phonetic Middle Name': '',
                    'Phonetic Last Name': '',
                    'Name Prefix': '',
                    'Name Suffix': '',
                    'Nickname': '',
                    'File As': membro.nome,
                    'Organization Name': membro.funcao.nome if membro.funcao else '',
                    'Organization Title': '',
                    'Organization Department': '',
                    'Birthday': membro.data_nascimento.strftime('%Y-%m-%d') if membro.data_nascimento else '',
                    'Notes': '',
                    'Photo': '',
                    'Labels': '* myContacts,* Other',
                    'E-mail 1 - Label': 'Other' if membro.email else '',
                    'E-mail 1 - Value': membro.email or '',
                    'Phone 1 - Label': '',
                    'Phone 1 - Value': membro.telefone or '',
                }
                writer.writerow(row)

        self.stdout.write(self.style.SUCCESS(f'Exportação concluída: {output_path.resolve()}'))
