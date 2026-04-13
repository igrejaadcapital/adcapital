import json
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from .models import Membro, Parentesco, Funcao, ConfiguracaoPortal, ConfiguracaoSite, FotoGaleria
from .serializers import MembroSerializer, ConfiguracaoPortalSerializer, ConfiguracaoSiteSerializer, FotoGaleriaSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adicionar_funcao(request):
    """Cria uma nova função manualmente (Apenas Admin)"""
    try:
        nome = request.data.get('nome')
        if not nome or not str(nome).strip():
            return Response({'error': 'Nome é obrigatório'}, status=400)
        
        # Limpa o nome para evitar espaços extras e padroniza
        nome_limpo = str(nome).strip().upper()
        
        funcao, created = Funcao.objects.get_or_create(nome=nome_limpo)
        return Response({
            'id': funcao.id, 
            'nome': funcao.nome, 
            'created': created,
            'success': True
        }, status=201)
    except Exception as e:
        # Se der erro 500, agora retornamos o motivo real em vez de uma página HTML genérica
        print(f"ERRO AO ADICIONAR FUNCAO: {str(e)}")
        return Response({
            'error': f"Erro no servidor: {str(e)}",
            'detail': "Verifique se a tabela de funções existe no banco de dados."
        }, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def buscar_opcoes_parentesco(request):
    """Retorna a lista dinâmica de graus de parentesco extraída do models"""
    opcoes = [{'id': f[0], 'nome': f[1]} for f in Parentesco.GRAU_CHOICES]
    return Response(opcoes)

@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def buscar_configuracao_publica(request):
    """Retorna apenas o status e a pergunta do portal para o público"""
    config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)
    return Response({
        "is_ativo": config.is_ativo,
        "pergunta": config.pergunta
    })

@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
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
        config = ConfiguracaoPortal.objects.filter(id=1).first()
        if not config:
            config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)
        serializer = self.get_serializer(config)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)
        serializer = self.get_serializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class ConfiguracaoSiteViewSet(viewsets.ModelViewSet):
    """Gestão da configuração do site institucional (id fixo = 1)"""
    queryset = ConfiguracaoSite.objects.all()
    serializer_class = ConfiguracaoSiteSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        config = ConfiguracaoSite.objects.filter(id=1).first()
        if not config:
             config, _ = ConfiguracaoSite.objects.get_or_create(id=1)
        serializer = self.get_serializer(config)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        config, _ = ConfiguracaoSite.objects.get_or_create(id=1)
        serializer = self.get_serializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class FotoGaleriaViewSet(viewsets.ModelViewSet):
    """Gestão da galeria de fotos do site"""
    queryset = FotoGaleria.objects.all().order_by('ordem', '-criado_em')
    serializer_class = FotoGaleriaSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

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
        
        # Se um documento LGPD foi enviado pelo admin, atualiza o status de consentimento
        try:
            if 'lgpd_documento' in self.request.data and self.request.data['lgpd_documento']:
                 membro.lgpd_consentido = True
                 if not membro.lgpd_data_aceite:
                      from django.utils import timezone
                      membro.lgpd_data_aceite = timezone.now()
                 membro.save()
        except Exception as e:
            print(f"Aviso: Erro ao salvar status LGPD no Admin: {e}")

        parentescos_data = self.request.data.get('parentescos_novo', [])
        
        # Se vier de um FormData como string JSON
        if isinstance(parentescos_data, str):
            try:
                parentescos_data = json.loads(parentescos_data)
            except:
                parentescos_data = []
        
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
    authentication_classes = [] # Desativa autenticação para o portal público
    parser_classes = [MultiPartParser, FormParser, JSONParser] # Suporte a diversos formatos de dados

    def post(self, request):
        try:
            config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)
            if not config.is_ativo:
                return Response({"error": "Portal desativado"}, status=403)

            # Verifica resposta de segurança novamente no servidor
            resposta_user = request.data.get('sync_resposta', '').strip().lower()
            resposta_correta = (config.resposta or "Jesus").strip().lower()

            if resposta_user != resposta_correta:
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
            
            # --- START LGPD LOGIC (Resilient) ---
            try:
                # Set consent true as it's required in the frontend
                membro.lgpd_consentido = True
                if not membro.lgpd_data_aceite:
                     from django.utils import timezone
                     membro.lgpd_data_aceite = timezone.now()
                
                # Generate PDF if it doesn't exist
                from .utils import gerar_termo_lgpd_pdf
                nome_arquivo, pdf_file = gerar_termo_lgpd_pdf(membro)
                membro.lgpd_documento.save(nome_arquivo, pdf_file, save=False)
                membro.save()

                # Enviar por e-mail
                if membro.email:
                    try:
                        from django.core.mail import EmailMessage
                        from django.conf import settings
                        
                        email_msg = EmailMessage(
                            subject='Bem-vindo! Seu Termo de Ciência e Aceite (LGPD)',
                            body=f'Olá {membro.nome},\n\nSeu cadastro no portal da Igreja Assembleia de Deus Ministério na Capital foi realizado com sucesso!\n\nEm anexo, enviamos a sua via do Termo de Consentimento de Dados Pessoais (LGPD) assinado eletronicamente no ato do seu cadastro.\n\nAtenciosamente,\nEquipe AD Capital',
                            from_email=settings.EMAIL_HOST_USER,
                            to=[membro.email],
                        )
                        
                        # Anexar o PDF
                        if membro.lgpd_documento:
                             membro.lgpd_documento.seek(0)
                             email_msg.attach(nome_arquivo, membro.lgpd_documento.read(), 'application/pdf')
                             
                        email_msg.send(fail_silently=True)
                    except Exception as email_err:
                        print(f"Erro ao enviar e-mail LGPD para {membro.email}: {email_err}")
            except Exception as lgpd_err:
                # Loga o erro mas NÃO quebra o request de cadastro
                print(f"AVISO: Falha na lógica LGPD (Cadastro salvo no entanto): {lgpd_err}")
            # --- END LGPD LOGIC ---

            # Lógica simplificada de parentesco para o auto-cadastro
            parentescos_data = request.data.get('parentescos_novo', [])

            # Se vier de um FormData como string JSON
            if isinstance(parentescos_data, str):
                try:
                    parentescos_data = json.loads(parentescos_data)
                except:
                    parentescos_data = []
            if membro_existente:
                Parentesco.objects.filter(membro_origem=membro).delete()
            
            for item in parentescos_data:
                p_id = item.get('parente_id') or item.get('membro_destino')
                grau = item.get('grau')
                if p_id and grau and str(p_id) != str(membro.id):
                    # Verifica se o parente realmente existe para evitar erro de integridade (ForeignKey)
                    if Membro.objects.filter(id=p_id).exists():
                        Parentesco.objects.get_or_create(
                            membro_origem=membro,
                            membro_destino_id=p_id,
                            defaults={'grau': grau}
                        )
            
            return Response({
                "success": True, 
                "message": "Cadastro realizado/atualizado com sucesso!",
                "id": membro.id,
                "is_update": membro_existente is not None,
                "lgpd_url": membro.lgpd_documento.url if membro.lgpd_documento else None
            })
        
        return Response(serializer.errors, status=400)
    
    except Exception as e:
        # LOG DE ERRO CRITICO (Isso vai aparecer nos logs do Render)
        print(f"ERRO CRITICO NO AUTO-CADASTRO: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Retornamos JSON em vez de HTML para não quebrar o CORS no frontend
        return Response({
            "error": "Erro interno no servidor ao processar cadastro.",
            "detail": str(e),
            "help": "Verifique se todos os campos obrigatórios estão preenchidos corretamente."
        }, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def download_termo_lgpd(request, pk):
    """Endpoint para baixar o termo de LGPD via API usando o Cloudinary"""
    try:
        from django.shortcuts import redirect
        membro = Membro.objects.get(pk=pk)
        if not membro.lgpd_documento:
             return Response({"error": "Termo não encontrado para este membro."}, status=404)
        
        # Como estamos usando Cloudinary, retornamos a URL direta para download
        return redirect(membro.lgpd_documento.url)
    except Membro.DoesNotExist:
        return Response({"error": "Membro não encontrado."}, status=404)