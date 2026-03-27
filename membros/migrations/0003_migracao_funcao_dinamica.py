from django.db import migrations, models
import django.db.models.deletion

def migrar_funcoes_para_model(apps, schema_editor):
    Membro = apps.get_model('membros', 'Membro')
    Funcao = apps.get_model('membros', 'Funcao')

    # Opções originais do modelo
    mapa = {
        'MEMBRO': 'Membro',
        'PASTOR': 'Pastor(a)',
        'PRESBITERO': 'Presbítero',
        'DIACONO': 'Diácono/Diaconisa',
        'EVANGELISTA': 'Evangelista',
        'MISSIONARIO': 'Missionário(a)',
        'COOPERADOR': 'Cooperador(a)'
    }

    # Garante que as funções básicas existam
    for sigla, nome_completo in mapa.items():
        f_obj, _ = Funcao.objects.get_or_create(nome=nome_completo)
        
        # Atualiza todos os membros que tinham essa sigla na coluna antiga
        # Usamos filter(funcao_old=sigla)
        Membro.objects.filter(funcao_old=sigla).update(funcao=f_obj)

class Migration(migrations.Migration):

    dependencies = [
        ('membros', '0002_create_superuser'),
    ]

    operations = [
        # 1. Cria a nova tabela de Funções
        migrations.CreateModel(
            name='Funcao',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=100, unique=True)),
            ],
        ),
        # 2. Renomeia o campo atual para 'funcao_old' para não perdermos os dados
        migrations.RenameField(
            model_name='membro',
            old_name='funcao',
            new_name='funcao_old',
        ),
        # 3. Cria o novo campo de chave estrangeira com o nome original 'funcao'
        migrations.AddField(
            model_name='membro',
            name='funcao',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='membros.funcao'),
        ),
        # 4. Executa a lógica de migração de dados
        migrations.RunPython(migrar_funcoes_para_model),
        # 5. Remove o campo antigo
        migrations.RemoveField(
            model_name='membro',
            name='funcao_old',
        ),
    ]
