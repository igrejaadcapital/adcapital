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
        
        return JsonResponse({'success': False, 'error': 'Resposta incorreta. Tente "Jesus".'}, status=401)
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
        data = json.loads(request.body)
        
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
            serializer = MembroSerializer(membro_existente, data=data, partial=True)
        else:
            serializer = MembroSerializer(data=data)

        if serializer.is_valid():
            membro = serializer.save()
            
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
                "id": membro.id
            })
            
        return JsonResponse(serializer.errors, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
