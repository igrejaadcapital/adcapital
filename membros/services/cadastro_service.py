"""Tarefas pesadas após auto-cadastro (PDF LGPD, e-mail, parentesco)."""
import traceback

from django.db import connection, close_old_connections

from membros.models import Membro
from membros.services.parentesco_service import salvar_parentescos
from membros.services.acesso_service import garantir_acesso_membro
from membros.services.lgpd_service import provisionar_termo_lgpd


def executar_tarefas_pos_cadastro(membro_id, parentescos_data):
    try:
        close_old_connections()
        membro = Membro.objects.get(id=membro_id)
        garantir_acesso_membro(membro)
        connection.close()

        provisionar_termo_lgpd(membro, enviar_email=True)

        close_old_connections()
        membro = Membro.objects.get(id=membro_id)
        if parentescos_data:
            salvar_parentescos(membro, parentescos_data)
    except Exception:
        print('--- [BG-THREAD] ERRO CRÍTICO EM TAREFAS DE BACKGROUND ---')
        traceback.print_exc()
    finally:
        try:
            connection.close()
        except Exception:
            pass
