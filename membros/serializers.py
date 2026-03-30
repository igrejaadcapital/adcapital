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
        # Busca ou cria a função. Se o banco falhar (ex: sem migração), 
        # retorna None em vez de 500
        try:
            obj, _ = self.get_queryset().get_or_create(**{self.slug_field: data})
            return obj
        except Exception:
            return None

    def to_representation(self, value):
        # Se for string (caso legado ou erro), retorna a string
        if isinstance(value, str):
            return value
        return super().to_representation(value)

class MembroSerializer(serializers.ModelSerializer):
    # Usamos o campo robusto para leitura/escrita
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
        extra_kwargs = {
            'data_nascimento': {'required': False, 'allow_null': True},
            'data_entrada': {'required': False, 'allow_null': True},
            'data_saida': {'required': False, 'allow_null': True},
            'email': {'required': False, 'allow_null': True},
            'telefone': {'required': False, 'allow_null': True},
        }

    def get_parentes(self, obj):
        # Busca parentescos onde este membro é a origem
        relacoes = Parentesco.objects.filter(membro_origem=obj)
        return ParentescoDetalheSerializer(relacoes, many=True).data

    def validate_nome(self, value):
        return value.upper() if value else value

    def validate_cpf(self, value):
        if not value:
            raise serializers.ValidationError("O CPF é obrigatório.")
        # Remove pontos e traços
        cpf_limpo = "".join(filter(str.isdigit, value))
        if len(cpf_limpo) != 11:
            raise serializers.ValidationError("CPF inválido. Deve ter 11 dígitos.")
        return cpf_limpo

    def validate_email(self, value):
        return value if value else None

    def validate_data_nascimento(self, value):
        return value if value else None

    def validate_data_entrada(self, value):
        return value if value else None

    def validate_data_saida(self, value):
        return value if value else None