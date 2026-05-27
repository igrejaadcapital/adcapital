from django.db import migrations


def rename_wildcard_admin_to_numeric(apps, schema_editor):
    """Migra logins legados do superusuário coringa para o documento institucional."""
    User = apps.get_model('auth', 'User')
    target = '45595281000'
    if User.objects.filter(username=target).exists():
        return
    for legacy in ('adminadcapital', 'admin'):
        user = User.objects.filter(username=legacy).first()
        if user:
            user.username = target
            user.save(update_fields=['username'])
            break


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('membros', '0019_alter_devocional_data_publicacao'),
    ]

    operations = [
        migrations.RunPython(rename_wildcard_admin_to_numeric, noop_reverse),
    ]
