from django.core.management.base import BaseCommand
from membros.models import Membro
from django.utils import timezone
from membros.utils import enviar_email_resend_api

class Command(BaseCommand):
    help = 'Envia e-mails de parabéns para os aniversariantes do dia'

    def handle(self, *args, **options):
        today = timezone.now().date()
        aniversariantes = Membro.objects.filter(
            data_nascimento__month=today.month,
            data_nascimento__day=today.day,
            status='LIGADO'
        )

        self.stdout.write(f"Encontrados {aniversariantes.count()} aniversariantes.")

        for m in aniversariantes:
            if m.email:
                subject = f"Parabéns pelo seu dia, {m.nome.split()[0]}! 🎂"
                body = (
                    f"Olá {m.nome},\n\n"
                    f"Toda a equipe da AD Capital deseja a você um feliz aniversário!\n"
                    f"Que Deus continue abençoando sua vida e iluminando seus caminhos.\n\n"
                    f"'{timezone.now().year} - Um ano de grandes vitórias!'\n\n"
                    f"Com carinho,\nAD Capital Igreja"
                )
                
                sucesso = enviar_email_resend_api(
                    to=m.email,
                    subject=subject,
                    body=body
                )
                
                if sucesso:
                    self.stdout.write(self.style.SUCCESS(f"E-mail enviado para {m.nome}"))
                else:
                    self.stdout.write(self.style.ERROR(f"Falha ao enviar e-mail para {m.nome}"))
