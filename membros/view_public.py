# membros/view_public.py
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .cors_public import apply_public_cors
from .rate_limit import rate_limit_or_none
from .models import Membro, ConfiguracaoPortal
from .serializers import MembroSerializer
from membros.services.parentesco_service import salvar_parentescos
from membros.services.acesso_service import garantir_acesso_membro, senha_padrao


def _json(request, data, status=200):
    response = JsonResponse(data, status=status)
    return apply_public_cors(request, response)


@csrf_exempt
def portal_verificar_resposta_direto(request):
    """
    Função pura de Django (não DRF) para validar a resposta do portal.
    CORS restrito aos domínios configurados em settings.CORS_ALLOWED_ORIGINS.
    """
    if request.method == 'OPTIONS':
        return _json(request, {'status': 'ok'})

    if request.method != 'POST':
        return _json(request, {'error': 'Apenas POST permitido'}, status=405)

    blocked = rate_limit_or_none(request, 'portal_verify', limit=20, period_seconds=60)
    if blocked:
        return apply_public_cors(request, blocked)

    try:
        data = json.loads(request.body)
        resposta_user = data.get('resposta', '').strip().lower()
        
        if not resposta_user:
            return _json(request, {'success': False, 'error': 'Digite uma resposta.'}, status=400)
            
        config, _ = ConfiguracaoPortal.objects.get_or_create(id=1)
        # Forçamos uma resposta correta válida se o campo estiver vazio no banco
        resposta_base = config.resposta.strip() if (config.resposta and config.resposta.strip()) else "Jesus"
        resposta_correta = resposta_base.lower()
        
        if not config.is_ativo:
            return _json(request, {'error': 'Portal desativado'}, status=403)

        if resposta_user == resposta_correta:
            return _json(request, {'success': True})

        return _json(request, {'success': False, 'error': 'Resposta incorreta. Tente novamente.'}, status=401)
    except Exception as e:
        return _json(request, {'error': str(e)}, status=500)

@csrf_exempt
def auto_cadastro_direto(request):
    """
    Função pura de Django para realizar o auto-cadastro sem DRF.
    Bypass total de erro 401.
    """
    if request.method == 'OPTIONS':
        return _json(request, {'status': 'ok'})

    if request.method != 'POST':
        return _json(request, {'error': 'Apenas POST permitido'}, status=405)

    blocked = rate_limit_or_none(request, 'cadastro_publico', limit=8, period_seconds=60)
    if blocked:
        return apply_public_cors(request, blocked)

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
            return _json(request, {"error": "Acesso negado: Resposta incorreta."}, status=401)

        cpf_original = data.get('cpf')
        if not cpf_original:
            return _json(request, {"error": "CPF é obrigatório"}, status=400)

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
                user, _created = garantir_acesso_membro(membro)
                senha_inicial = senha_padrao(cpf_limpo)

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
                    def enviar_bg(m_id, filename, content):
                        from django.db import connection, close_old_connections
                        try:
                            # Libera conexão antes de chamar API externa
                            close_old_connections()
                            connection.close()

                            from .utils import enviar_email_resend_api
                            from .models import Membro
                            
                            # Busca o membro apenas para garantir que existe
                            # Mas não precisamos segurar a conexão se já temos os dados
                            # No entanto, o resend não precisa do DB
                            
                            msg_corpo = (
                                f"Olá {membro.nome},\n\n"
                                "É com alegria que confirmamos o seu cadastro no portal da Igreja AD Capital.\n\n"
                                "🔐 **SEU ACESSO AO PORTAL DO MEMBRO:**\n"
                                f"Para acessar seu perfil e acompanhar a igreja, use os dados abaixo:\n"
                                f"Site: https://adcapitaligreja.com.br/#/portal\n"
                                f"Usuário (CPF): {membro.cpf}\n"
                                f"Senha Padrão: {senha_inicial}\n"
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
                                filename=filename,
                                file_content=content
                            )
                        except Exception as email_err:
                            print(f"Erro ao enviar via Resend (bg): {email_err}")
                        finally:
                            try:
                                connection.close()
                            except:
                                pass
                    
                    threading.Thread(
                        target=enviar_bg, 
                        args=(membro.id, nome_arquivo, pdf_bytes)
                    ).start()
            except Exception as user_err:
                print(f"AVISO: Falha na criação de usuário ou e-mail: {user_err}")
            # --- END USER ACCESS & LGPD LOGIC ---

            # Lógica de Parentesco (Apenas se enviado, para evitar apagar o que já existe em um update parcial)
            if 'parentescos_novo' in data:
                salvar_parentescos(membro, data.get('parentescos_novo', []))
            
            return _json(request, {
                "success": True,
                "message": "Cadastro salvo!",
                "id": membro.id,
                "lgpd_url": membro.lgpd_documento.url if membro.lgpd_documento else None,
            })

        return _json(request, serializer.errors, status=400)
    except Exception as e:
        return _json(request, {'error': str(e)}, status=500)
