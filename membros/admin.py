from django.contrib import admin
from .models import Membro, Parentesco

@admin.register(Membro)
class MembroAdmin(admin.ModelAdmin):
    list_display = ('nome', 'genero', 'status', 'funcao')
    list_filter = ('genero', 'status', 'funcao')
    search_fields = ('nome',)

@admin.register(Parentesco)
class ParentescoAdmin(admin.ModelAdmin):
    list_display = ('membro_origem', 'grau', 'membro_destino')