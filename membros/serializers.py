from rest_framework import serializers
from .models import Membro, Parentesco

class ParentescoDetalheSerializer(serializers.ModelSerializer):
    nome_parente = serializers.ReadOnlyField(source='membro_destino.nome')
    
    class Meta:
        model = Parentesco
        fields = ['id', 'membro_destino', 'nome_parente', 'grau']

class MembroSerializer(serializers.ModelSerializer):
    # Isso vai buscar todos os parentes vinculados a este membro
    parentes = serializers.SerializerMethodField()

    class Meta:
        model = Membro
        fields = '__all__'

    def get_parentes(self, obj):
        # Busca parentescos onde este membro é a origem
        relacoes = Parentesco.objects.filter(membro_origem=obj)
        return ParentescoDetalheSerializer(relacoes, many=True).data