from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_superuser(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    # Login numérico (CPF/CNPJ customizado) para compatibilidade com o portal.
    admin_username = '45595281000'
    if not User.objects.filter(username=admin_username).exists():
        User.objects.create(
            username=admin_username,
            email='admin@igreja.com',
            password=make_password('admin123'),
            is_superuser=True,
            is_staff=True,
            is_active=True
        )

class Migration(migrations.Migration):

    dependencies = [
        ('membros', '0001_initial'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]
