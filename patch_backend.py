import os

# 1. Modificar models.py
with open('c:/Users/Diego/developer/membros/models.py', 'r', encoding='utf-8') as f:
    models_text = f.read()

if 'curtidas_palavra' not in models_text:
    models_text = models_text.replace(
        'pastor_foto = models.ImageField(upload_to=\'site/pastor/\', blank=True, null=True, verbose_name="Foto do Pastor")',
        'pastor_foto = models.ImageField(upload_to=\'site/pastor/\', blank=True, null=True, verbose_name="Foto do Pastor")\n    curtidas_palavra = models.PositiveIntegerField(default=0, verbose_name="Curtidas na Palavra Pastoral")'
    )
    with open('c:/Users/Diego/developer/membros/models.py', 'w', encoding='utf-8') as f:
        f.write(models_text)
    print("models.py atualizado")

# 2. Modificar views.py
with open('c:/Users/Diego/developer/membros/views.py', 'r', encoding='utf-8') as f:
    views_text = f.read()

if 'curtir_palavra' not in views_text:
    views_addition = """
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def curtir_palavra(request):
    \"\"\"Incrementa a contagem de curtidas na palavra pastoral.\"\"\"
    _garantir_keep_alive()
    from django.db import close_old_connections
    try:
        close_old_connections()
        config, _ = ConfiguracaoSite.objects.get_or_create(id=1)
        config.curtidas_palavra += 1
        config.save()
        return Response({'success': True, 'curtidas_palavra': config.curtidas_palavra})
    except Exception as e:
        return Response({'error': str(e)}, status=500)
"""
    views_text = views_text.replace(
        "def ultimo_video_youtube(request):",
        views_addition.lstrip() + "\n@api_view(['GET'])\n@permission_classes([AllowAny])\n@authentication_classes([])\ndef ultimo_video_youtube(request):"
    )
    with open('c:/Users/Diego/developer/membros/views.py', 'w', encoding='utf-8') as f:
        f.write(views_text)
    print("views.py atualizado")

# 3. Modificar urls.py
with open('c:/Users/Diego/developer/membros/urls.py', 'r', encoding='utf-8') as f:
    urls_text = f.read()

if 'curtir_palavra' not in urls_text:
    urls_text = urls_text.replace(
        'init_site,',
        'init_site,\n    curtir_palavra,'
    )
    urls_text = urls_text.replace(
        "path('init-site/', init_site, name='init-site'),",
        "path('init-site/', init_site, name='init-site'),\n    path('curtir-palavra/', curtir_palavra, name='curtir-palavra'),"
    )
    with open('c:/Users/Diego/developer/membros/urls.py', 'w', encoding='utf-8') as f:
        f.write(urls_text)
    print("urls.py atualizado")
