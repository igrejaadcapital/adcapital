# membros/view_public.py
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Membro, ConfiguracaoPortal, Funcao, Parentesco
from .serializers import MembroSerializer

@csrf_exempt
def portal_verificar_resposta_direto(request):
    """
    Função pura de Django (não DRF) para validar a resposta do portal.
    Inclui suporte manual a CORS para evitar travamentos de 'Preflight'.
    """
    # Suporte manual a Preflight (OPTIONS)
    if request.method == 'OPTIONS':
        response = JsonResponse({'status': 'ok'})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    if request.method != 'POST':
        return JsonResponse({'error': 'Apenas POST permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        resposta_user = data.get('resposta', '').strip().lower()
        
        if not resposta_user:
            return JsonResponse({'success': False, 'error': 'Digite uma resposta.'}, status=400)
            
        config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)
        # Forçamos uma resposta correta válida se o campo estiver vazio no banco
        resposta_base = config.resposta.strip() if (config.resposta and config.resposta.strip()) else "Jesus"
        resposta_correta = resposta_base.lower()
        
        if not config.is_ativo:
            return JsonResponse({'error': 'Portal desativado'}, status=403)
            
        if resposta_user == resposta_correta:
            return JsonResponse({'success': True})
        
        return JsonResponse({'success': False, 'error': 'Resposta incorreta. Tente novamente.'}, status=401)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def auto_cadastro_direto(request):
    """
    Função pura de Django para realizar o auto-cadastro sem DRF.
    Bypass total de erro 401.
    """
    # Suporte manual a Preflight (OPTIONS)
    if request.method == 'OPTIONS':
        response = JsonResponse({'status': 'ok'})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    if request.method != 'POST':
        return JsonResponse({'error': 'Apenas POST permitido'}, status=405)
    try:
        # Detecta o tipo de conteúdo para saber como ler os dados
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            # Caso FormData (upload de arquivos) ou form-url-encoded
            data = request.POST.dict()
            if request.FILES:
                data.update(request.FILES.dict())
        
        # Validação de segurança redundante
        config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)
        resposta_user = data.get('sync_resposta', '').strip().lower()
        if resposta_user != (config.resposta or "Jesus").strip().lower():
             return JsonResponse({"error": "Acesso negado: Resposta incorreta."}, status=401)

        cpf_original = data.get('cpf')
        if not cpf_original:
            return JsonResponse({"error": "CPF é obrigatório"}, status=400)

        cpf_limpo = "".join(filter(str.isdigit, cpf_original))
        membro_existente = Membro.objects.filter(cpf=cpf_limpo).first()
        
        # Usamos o Serializer manualmente (apenas para validação/salvamento)
        if membro_existente:
            # Filtramos campos vazios para não sobrescrever dados existentes com "nada"
            # em um auto-cadastro (que se comporta como blind update parcial)
            data_limpa = {k: v for k, v in data.items() if v not in [None, "", "null", "undefined"]}
            serializer = MembroSerializer(membro_existente, data=data_limpa, partial=True)
        else:
            serializer = MembroSerializer(data=data)

        if serializer.is_valid():
            membro = serializer.save()
            
            # --- START USER ACCESS & LGPD LOGIC ---
            try:
                # 1. Criar Usuário para o Portal (se não existir)
                from django.contrib.auth.models import User
                from .models import Perfil
                
                username = cpf_limpo
                senha_padrao = cpf_limpo[:5] # 5 primeiros dígitos do CPF
                
                user, created = User.objects.get_or_create(username=username, defaults={'email': membro.email or ''})
                if created:
                    user.set_password(senha_padrao)
                    user.save()
                
                # Garante vínculo Perfil -> Membro
                perfil, _ = Perfil.objects.get_or_create(user=user)
                perfil.membro = membro
                perfil.role = 'MEMBRO'
                perfil.save()

                # 2. Geração de PDF do Termo
                from .utils import gerar_termo_lgpd_pdf
                nome_arquivo, pdf_file = gerar_termo_lgpd_pdf(membro)
                pdf_bytes = pdf_file.read()
                
                from django.core.files.base import ContentFile
                membro.lgpd_documento.save(nome_arquivo, ContentFile(pdf_bytes), save=False)
                membro.save()

                # 3. Enviar por e-mail com Instruções de Acesso
                if membro.email:
                    import threading
                    def enviar_bg():
                        try:
                            from .utils import enviar_email_resend_api
                            msg_corpo = (
                                f"Olá {membro.nome},\n\n"
                                "É com alegria que confirmamos o seu cadastro no portal da Igreja AD Capital.\n\n"
                                "🔐 **SEU ACESSO AO PORTAL DO MEMBRO:**\n"
                                f"Para acessar seu perfil e acompanhar a igreja, use os dados abaixo:\n"
                                f"Site: https://adcapitaligreja.com.br/#/portal\n"
                                f"Usuário (CPF): {membro.cpf}\n"
                                f"Senha Padrão: {senha_padrao}\n"
                                "(Recomendamos alterar sua senha após o primeiro acesso)\n\n"
                                "📄 **TERMO LGPD:**\n"
                                "Enviamos em anexo o Termo de Consentimento de Dados Pessoais. "
                                "Pedimos a gentileza de assinar e nos enviar uma foto legível ou cópia digitalizada.\n\n"
                                "Fraternalmente,\nEquipe AD Capital"
                            )
                            
                            enviar_email_resend_api(
                                to=membro.email,
                                subject='Bem-vindo à AD Capital! (Acesso ao Portal)',
                                body=msg_corpo,
                                filename=nome_arquivo,
                                file_content=pdf_bytes
                            )
                        except Exception as email_err:
                            print(f"Erro ao enviar via Resend (bg): {email_err}")
                    
                    threading.Thread(target=enviar_bg).start()
            except Exception as user_err:
                print(f"AVISO: Falha na criação de usuário ou e-mail: {user_err}")
            # --- END USER ACCESS & LGPD LOGIC ---

            # Lógica de Parentesco (Apenas se enviado, para evitar apagar o que já existe em um update parcial)
            if 'parentescos_novo' in data:
                parentescos_data = data.get('parentescos_novo', [])
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
                        Parentesco.objects.get_or_create(
                            membro_origem=membro,
                            membro_destino_id=p_id,
                            defaults={'grau': grau}
                        )
            
            return JsonResponse({
                "success": True, 
                "message": "Cadastro salvo!",
                "id": membro.id,
                "lgpd_url": membro.lgpd_documento.url if membro.lgpd_documento else None
            })
            
        return JsonResponse(serializer.errors, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
