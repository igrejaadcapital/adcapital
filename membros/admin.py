from django.contrib import admin
from .models import Membro, Parentesco, Perfil, Funcao, ConfiguracaoPortal, ConfiguracaoSite, FotoGaleria

@admin.register(Membro)
class MembroAdmin(admin.ModelAdmin):
    list_display = ('nome', 'genero', 'status', 'funcao')
    list_filter = ('genero', 'status', 'funcao')
    search_fields = ('nome', 'cpf')

@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'membro')
    list_filter = ('role',)
    search_fields = ('user__username', 'membro__nome')

@admin.register(Parentesco)
class ParentescoAdmin(admin.ModelAdmin):
    list_display = ('membro_origem', 'grau', 'membro_destino')

@admin.register(Funcao)
class FuncaoAdmin(admin.ModelAdmin):
    list_display = ('nome',)

admin.site.register(ConfiguracaoPortal)
admin.site.register(ConfiguracaoSite)
admin.site.register(FotoGaleria)