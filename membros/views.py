from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from .models import Membro, Parentesco, Funcao, ConfiguracaoPortal
from .serializers import MembroSerializer, ConfiguracaoPortalSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def buscar_opcoes_funcao(request):
    """Retorna a lista dinâmica de funções da tabela Funcao"""
    try:
        funcoes = Funcao.objects.all().order_by('nome')
        opcoes = [{'id': f.id, 'nome': f.nome} for f in funcoes]
        return Response(opcoes)
    except Exception:
        return Response([{'id': 1, 'nome': 'Membro'}])

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def excluir_funcao(request, pk):
    """Exclui uma função pelo ID (Apenas Admin)"""
    try:
        funcao = Funcao.objects.get(pk=pk)
        funcao.delete()
        return Response({'success': True})
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def buscar_opcoes_parentesco(request):
    """Retorna a lista dinâmica de graus de parentesco extraída do models"""
    opcoes = [{'id': f[0], 'nome': f[1]} for f in Parentesco.GRAU_CHOICES]
    return Response(opcoes)

@api_view(['GET'])
@permission_classes([AllowAny])
def buscar_configuracao_publica(request):
    """Retorna apenas o status e a pergunta do portal para o público"""
    config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)
    return Response({
        "is_ativo": config.is_ativo,
        "pergunta": config.pergunta
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def verificar_resposta_portal(request):
    """Verifica se a resposta do membro está correta para liberar o formulário"""
    resposta_user = request.data.get('resposta', '').strip().lower()
    config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)
    
    # Se por algum motivo a resposta no banco estiver vazia, usamos o padrão "Jesus"
    resposta_correta = (config.resposta or "Jesus").strip().lower()

    if not config.is_ativo:
        return Response({"error": "O portal de cadastro está desativado no momento."}, status=403)
        
    if resposta_user == resposta_correta:
        return Response({"success": True})
    return Response({"success": False, "error": "Resposta incorreta. Dica: Tente 'Jesus'."}, status=401)

class ConfiguracaoPortalViewSet(viewsets.ModelViewSet):
    """Gerenciamento da configuração pelo Admin (id fixo = 1)"""
    queryset = ConfiguracaoPortal.objects.all()
    serializer_class = ConfiguracaoPortalSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)
        serializer = self.get_serializer(config)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)
        serializer = self.get_serializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class MembroViewSet(viewsets.ModelViewSet):
    """CRUD administrativo completo para Membros"""
    queryset = Membro.objects.all()
    serializer_class = MembroSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        self._salvar_com_parentescos(serializer)

    def perform_update(self, serializer):
        self._salvar_com_parentescos(serializer)

    def _salvar_com_parentescos(self, serializer):
        membro = serializer.save()
        parentescos_data = self.request.data.get('parentescos_novo', [])
        
        if self.action in ['update', 'partial_update']:
            Parentesco.objects.filter(membro_origem=membro).delete()

        for item in parentescos_data:
            p_id = item.get('parente_id') or item.get('membro_destino')
            grau = item.get('grau')
            if p_id and grau and str(p_id) != str(membro.id):
                Parentesco.objects.get_or_create(
                    membro_origem=membro,
                    membro_destino_id=p_id,
                    defaults={'grau': grau}
                )

class AutoCadastroMembroView(APIView):
    """
    Endpoint para auto-cadastro de membros.
    Permite criar ou editar (se CPF já existir e resposta estiver correta).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)
        if not config.is_ativo:
            return Response({"error": "Portal desativado"}, status=403)

        # Verifica resposta de segurança novamente no servidor
        resposta_user = request.data.get('sync_resposta', '').strip().lower()
        if resposta_user != config.resposta.strip().lower():
             return Response({"error": "Acesso negado: Resposta incorreta."}, status=401)

        cpf_original = request.data.get('cpf')
        if not cpf_original:
            return Response({"error": "CPF é obrigatório"}, status=400)

        # Limpa o CPF para busca
        cpf_limpo = "".join(filter(str.isdigit, cpf_original))
        
        # Busca se o membro já existe
        membro_existente = Membro.objects.filter(cpf=cpf_limpo).first()
        
        if membro_existente:
            # Edição (Update)
            serializer = MembroSerializer(membro_existente, data=request.data, partial=True)
        else:
            # Novo Cadastro (Create)
            serializer = MembroSerializer(data=request.data)

        if serializer.is_valid():
            membro = serializer.save()
            # Lógica simplificada de parentesco para o auto-cadastro
            parentescos_data = request.data.get('parentescos_novo', [])
            if membro_existente:
                Parentesco.objects.filter(membro_origem=membro).delete()
            
            for item in parentescos_data:
                p_id = item.get('parente_id') or item.get('membro_destino')
                grau = item.get('grau')
                if p_id and grau and str(p_id) != str(membro.id):
                    Parentesco.objects.get_or_create(
                        membro_origem=membro,
                        membro_destino_id=p_id,
                        defaults={'grau': grau}
                    )
            
            return Response({
                "success": True, 
                "message": "Cadastro realizado/atualizado com sucesso!",
                "id": membro.id,
                "is_update": membro_existente is not None
            })
        
        return Response(serializer.errors, status=400)