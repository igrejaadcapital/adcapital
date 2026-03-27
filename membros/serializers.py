from rest_framework import serializers
from .models import Membro, Parentesco, Funcao

class ParentescoDetalheSerializer(serializers.ModelSerializer):
    nome_parente = serializers.ReadOnlyField(source='membro_destino.nome')
    
    class Meta:
        model = Parentesco
        fields = ['id', 'membro_destino', 'nome_parente', 'grau']

class FuncaoSlugField(serializers.SlugRelatedField):
    def to_internal_value(self, data):
        if not data:
            return None
        # Tenta buscar ou criar a função pelo nome enviado
        obj, _ = self.get_queryset().get_or_create(**{self.slug_field: data})
        return obj

class MembroSerializer(serializers.ModelSerializer):
    # Isso permite enviar o nome da função e o Django resolve o ID
    funcao = FuncaoSlugField(
        slug_field='nome', 
        queryset=Funcao.objects.all(),
        required=False,
        allow_null=True
    )
    # Isso vai buscar todos os parentes vinculados a este membro
    parentes = serializers.SerializerMethodField()

    class Meta:
        model = Membro
        fields = '__all__'

    def get_parentes(self, obj):
        # Busca parentescos onde este membro é a origem
        relacoes = Parentesco.objects.filter(membro_origem=obj)
        return ParentescoDetalheSerializer(relacoes, many=True).data

    def validate_email(self, value):
        if value == "":
            return None
        return value