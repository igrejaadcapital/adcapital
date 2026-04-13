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
            serializer = MembroSerializer(membro_existente, data=data, files=request.FILES, partial=True)
        else:
            serializer = MembroSerializer(data=data, files=request.FILES)

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
                        if pdf_file:
                             pdf_file.seek(0)
                             email_msg.attach(nome_arquivo, pdf_file.read(), 'application/pdf')
                             
                        email_msg.send(fail_silently=True)
                    except Exception as email_err:
                        print(f"Erro ao enviar e-mail LGPD para {membro.email}: {email_err}")
            except Exception as lgpd_err:
                # Loga o erro mas NÃO quebra o request de cadastro
                print(f"AVISO: Falha na lógica LGPD (Cadastro salvo no entanto): {lgpd_err}")
            # --- END LGPD LOGIC ---

            # Lógica de Parentesco
            parentescos_data = data.get('parentescos_novo', [])
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
