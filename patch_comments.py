import os

models_path = 'c:/Users/Diego/developer/membros/models.py'
with open(models_path, 'r', encoding='utf-8') as f:
    models_text = f.read()

# Add ano_ultimo_email_aniversario
if 'ano_ultimo_email_aniversario' not in models_text:
    models_text = models_text.replace(
        'unidade = models.CharField(max_length=100, default=\'Sede\')',
        'unidade = models.CharField(max_length=100, default=\'Sede\')\n    ano_ultimo_email_aniversario = models.IntegerField(null=True, blank=True, verbose_name="Ano Último Email Aniversário")'
    )

# Add ComentarioPalavra
if 'class ComentarioPalavra' not in models_text:
    models_text += """
class ComentarioPalavra(models.Model):
    configuracao = models.ForeignKey(ConfiguracaoSite, on_delete=models.CASCADE, related_name='comentarios')
    nome = models.CharField(max_length=100, verbose_name="Nome do Visitante")
    texto = models.TextField(verbose_name="Comentário")
    criado_em = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-criado_em']
        verbose_name = "Comentário da Palavra"
        verbose_name_plural = "Comentários da Palavra"

    def __str__(self):
        return f"{self.nome} - {self.criado_em.strftime('%d/%m/%Y')}"
"""

with open(models_path, 'w', encoding='utf-8') as f:
    f.write(models_text)

# serializers.py
serializers_path = 'c:/Users/Diego/developer/membros/serializers.py'
with open(serializers_path, 'r', encoding='utf-8') as f:
    serializers_text = f.read()

if 'class ComentarioPalavraSerializer' not in serializers_text:
    serializers_text = serializers_text.replace(
        'from .models import Membro, Funcao, Parentesco, ConfiguracaoPortal, ConfiguracaoSite, FotoGaleria, Perfil',
        'from .models import Membro, Funcao, Parentesco, ConfiguracaoPortal, ConfiguracaoSite, FotoGaleria, Perfil, ComentarioPalavra'
    )
    serializers_text += """
class ComentarioPalavraSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComentarioPalavra
        fields = '__all__'
"""
    with open(serializers_path, 'w', encoding='utf-8') as f:
        f.write(serializers_text)

# view_public.py for the birthday check logic
# Actually I will add it to views.py
views_path = 'c:/Users/Diego/developer/membros/views.py'
with open(views_path, 'r', encoding='utf-8') as f:
    views_text = f.read()

if 'ComentarioPalavraViewSet' not in views_text:
    views_text = views_text.replace(
        'from .models import Membro, Funcao, Parentesco, ConfiguracaoPortal, ConfiguracaoSite, FotoGaleria, Perfil',
        'from .models import Membro, Funcao, Parentesco, ConfiguracaoPortal, ConfiguracaoSite, FotoGaleria, Perfil, ComentarioPalavra'
    )
    views_text = views_text.replace(
        'from .serializers import (',
        'from .serializers import (\n    ComentarioPalavraSerializer,'
    )
    views_text += """
class ComentarioPalavraViewSet(viewsets.ModelViewSet):
    queryset = ComentarioPalavra.objects.all()
    serializer_class = ComentarioPalavraSerializer
    permission_classes = [AllowAny]  # GET e POST livres, DELETE protegido no frontend ou aqui

    def get_permissions(self):
        if self.action == 'destroy':
            return [IsAuthenticated()]
        return [AllowAny()]
"""

if 'verificar_aniversarios' not in views_text:
    views_text += """
import datetime
from .utils import enviar_email_resend_api

@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def verificar_aniversarios(request):
    try:
        hoje = datetime.date.today()
        membros = Membro.objects.filter(
            data_nascimento__month=hoje.month, 
            data_nascimento__day=hoje.day
        ).exclude(ano_ultimo_email_aniversario=hoje.year).exclude(email__isnull=True).exclude(email__exact='')
        
        enviados = 0
        for m in membros:
            html = f\"\"\"
            <html><body>
                <h2 style="color: #2563eb;">Feliz Aniversário, {m.nome}! 🎉</h2>
                <p>Nós da <strong>Igreja AD Capital</strong> louvamos a Deus pela sua vida e oramos para que o Senhor derrame ricas bênçãos sobre você neste dia tão especial.</p>
                <p><em>"O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e te conceda paz." (Números 6:24-26)</em></p>
                <p>Um forte abraço da sua família na fé!</p>
            </body></html>
            \"\"\"
            enviar_email_resend_api(
                para=[m.email],
                assunto=f"Feliz Aniversário, {m.nome}! 🎉",
                html_conteudo=html
            )
            m.ano_ultimo_email_aniversario = hoje.year
            m.save()
            enviados += 1
            
        return Response({'success': True, 'enviados': enviados})
    except Exception as e:
        return Response({'error': str(e)}, status=500)
"""

with open(views_path, 'w', encoding='utf-8') as f:
    f.write(views_text)

# urls.py
urls_path = 'c:/Users/Diego/developer/membros/urls.py'
with open(urls_path, 'r', encoding='utf-8') as f:
    urls_text = f.read()

if 'ComentarioPalavraViewSet' not in urls_text:
    urls_text = urls_text.replace(
        'from .views import (',
        'from .views import (\n    ComentarioPalavraViewSet,\n    verificar_aniversarios,'
    )
    urls_text = urls_text.replace(
        "router.register(r'galeria', FotoGaleriaViewSet, basename='galeria')",
        "router.register(r'galeria', FotoGaleriaViewSet, basename='galeria')\nrouter.register(r'comentarios', ComentarioPalavraViewSet, basename='comentarios')"
    )
    urls_text = urls_text.replace(
        "path('curtir-palavra/', curtir_palavra, name='curtir-palavra'),",
        "path('curtir-palavra/', curtir_palavra, name='curtir-palavra'),\n    path('verificar-aniversarios/', verificar_aniversarios, name='verificar-aniversarios'),"
    )

with open(urls_path, 'w', encoding='utf-8') as f:
    f.write(urls_text)
