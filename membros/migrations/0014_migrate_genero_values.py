from django.db import migrations

def migrate_genero_to_mf(apps, schema_editor):
    Membro = apps.get_model('membros', 'Membro')
    # Atualiza 'VARAO' -> 'M'
    Membro.objects.filter(genero='VARAO').update(genero='M')
    # Atualiza 'VAROA' -> 'F'
    Membro.objects.filter(genero='VAROA').update(genero='F')

def reverse_migrate_mf_to_varao(apps, schema_editor):
    Membro = apps.get_model('membros', 'Membro')
    # Reverte 'M' -> 'VARAO'
    Membro.objects.filter(genero='M').update(genero='VARAO')
    # Reverte 'F' -> 'VAROA'
    Membro.objects.filter(genero='F').update(genero='VAROA')

class Migration(migrations.Migration):
    dependencies = [
        ('membros', '0013_alter_membro_genero'),
    ]

    operations = [
        migrations.RunPython(migrate_genero_to_mf, reverse_migrate_mf_to_varao),
    ]
