# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from membros.models import Membro, Perfil
import re

class Command(BaseCommand):
    help = 'Gera usuários e senhas automáticas para todos os membros cadastrados'

    def handle(self, *args, **options):
        membros = Membro.objects.all()
        criados = 0
        atualizados = 0

        self.stdout.write(f"Iniciando geração de acessos para {membros.count()} membros...")

        for m in membros:
            if not m.cpf:
                self.stdout.write(self.style.WARNING(f"Membro {m.nome} não possui CPF. Pulando..."))
                continue

            # Limpa CPF para ter apenas números
            cpf_limpo = "".join(re.findall(r'\d+', m.cpf))
            
            if not cpf_limpo or len(cpf_limpo) < 5:
                self.stdout.write(self.style.WARNING(f"CPF inválido para {m.nome}. Pulando..."))
                continue

            # Lógica da Senha: Adcapital + 5 primeiros dígitos do CPF
            senha_inicial = f"Adcapital{cpf_limpo[:5]}"
            
            # Verifica se já existe usuário com este CPF
            user, created = User.objects.get_or_create(username=cpf_limpo)
            
            if created:
                user.set_password(senha_inicial)
                user.first_name = m.nome.split()[0]
                user.save()
                criados += 1
            else:
                atualizados += 1

            # Garante que o Perfil existe e está vinculado ao Membro
            perfil, _ = Perfil.objects.get_or_create(user=user)
            perfil.membro = m
            perfil.role = 'MEMBRO'
            perfil.save()

        self.stdout.write(self.style.SUCCESS(f"Concluído! Usuários criados: {criados}. Usuários já existentes/vinculados: {atualizados}."))
