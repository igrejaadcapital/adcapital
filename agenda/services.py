import os
import json
import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from django.conf import settings
from django.utils import timezone

SCOPES = ['https://www.googleapis.com/auth/calendar']
# Pega o caminho absoluto da raiz do projeto para achar o json de forma segura
SERVICE_ACCOUNT_FILE = os.path.join(settings.BASE_DIR, 'google_credentials.json')
CALENDAR_ID = 'igrejaadcapital@gmail.com'

def get_calendar_service():
    """
    Tenta carregar as credenciais tanto de arquivo (local) quanto de 
    variável de ambiente (Render), para garantir a sincronização.
    """
    creds = None
    
    # 1. Tenta carregar da variável de ambiente (Seguro para Produção)
    env_creds = os.environ.get('GOOGLE_CREDENTIALS_JSON')
    if env_creds:
        try:
            creds_dict = json.loads(env_creds)
            creds = service_account.Credentials.from_service_account_info(
                creds_dict, scopes=SCOPES)
        except Exception as e:
            print("Erro ao carregar credenciais da variável de ambiente:", e)

    # 2. Se não houver variável, tenta carregar do arquivo local (Desenvolvimento)
    if not creds and os.path.exists(SERVICE_ACCOUNT_FILE):
        try:
            creds = service_account.Credentials.from_service_account_file(
                SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        except Exception as e:
            print("Erro ao carregar credenciais do arquivo local:", e)

    if not creds:
        return None
    
    return build('calendar', 'v3', credentials=creds)

def sync_event_to_google(titulo, descricao, data_inicio, data_fim):
    """
    Cria ou atualiza um evento no Google Calendar e retorna o ID gerado pelo Google.
    """
    service = get_calendar_service()
    if not service:
        return None

    # Garante que a data enviada para o Google esteja no fuso de Brasília
    local_inicio = timezone.localtime(data_inicio)
    local_fim = timezone.localtime(data_fim)

    evento_body = {
        'summary': titulo,
        'description': descricao,
        'start': {
            'dateTime': local_inicio.isoformat(),
            'timeZone': 'America/Sao_Paulo',
        },
        'end': {
            'dateTime': local_fim.isoformat(),
            'timeZone': 'America/Sao_Paulo',
        },
    }

    try:
        evento_criado = service.events().insert(calendarId=CALENDAR_ID, body=evento_body).execute()
        return evento_criado.get('id')
    except Exception as e:
        print("Erro ao sincronizar com Google Calendar:", e)
        return None

def update_event_to_google(google_event_id, titulo, descricao, data_inicio, data_fim):
    """
    Atualiza um evento existente no Google Calendar.
    """
    if not google_event_id:
        return False

    service = get_calendar_service()
    if not service:
        return False

    # Garante que a data enviada para o Google esteja no fuso de Brasília
    local_inicio = timezone.localtime(data_inicio)
    local_fim = timezone.localtime(data_fim)

    evento_body = {
        'summary': titulo,
        'description': descricao,
        'start': {
            'dateTime': local_inicio.isoformat(),
            'timeZone': 'America/Sao_Paulo',
        },
        'end': {
            'dateTime': local_fim.isoformat(),
            'timeZone': 'America/Sao_Paulo',
        },
    }

    try:
        service.events().update(calendarId=CALENDAR_ID, eventId=google_event_id, body=evento_body).execute()
        return True
    except Exception as e:
        print(f"Erro ao atualizar evento {google_event_id} no Google Calendar:", e)
        return False

def delete_event_from_google(google_event_id):
    """
    Deleta um evento no Google Calendar caso ele exista.
    """
    if not google_event_id:
        return

    service = get_calendar_service()
    if not service:
        return

    try:
        service.events().delete(calendarId=CALENDAR_ID, eventId=google_event_id).execute()
    except Exception as e:
        print(f"Erro ao deletar evento {google_event_id} no Google Calendar:", e)
