"""Verificações de infraestrutura e montagem de alertas por e-mail."""
from __future__ import annotations

import json
import os
import ssl
import socket
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SSL_HOSTS = [
    'sistema.adcapitaligreja.com.br',
    'api.adcapitaligreja.com.br',
    'adcapitaligreja.com.br',
    'www.adcapitaligreja.com.br',
]

HTTP_CHECKS = [
    ('API ping', 'https://api.adcapitaligreja.com.br/api/v1/ping/'),
    ('API health', 'https://api.adcapitaligreja.com.br/api/v1/health/'),
    ('Front sistema', 'https://sistema.adcapitaligreja.com.br/'),
    ('Auto-cadastro', 'https://sistema.adcapitaligreja.com.br/#/cadastro'),
    ('Site institucional', 'https://adcapitaligreja.com.br/'),
]

Nivel = Literal['OK', 'AVISO', 'CRITICO']


@dataclass
class ResultadoCheck:
    nome: str
    nivel: Nivel
    detalhe: str


@dataclass
class RelatorioInfra:
    gerado_em: datetime
    resultados: list[ResultadoCheck] = field(default_factory=list)

    @property
    def tem_problema(self) -> bool:
        return any(r.nivel in ('AVISO', 'CRITICO') for r in self.resultados)

    @property
    def tem_critico(self) -> bool:
        return any(r.nivel == 'CRITICO' for r in self.resultados)


def _parse_ssl_date(not_after: str) -> datetime:
    # Ex.: 'Aug 15 12:00:00 2026 GMT'
    return datetime.strptime(not_after, '%b %d %H:%M:%S %Y GMT').replace(tzinfo=timezone.utc)


def _dias_restantes(dt: datetime) -> int:
    agora = datetime.now(timezone.utc)
    return (dt - agora).days


def checar_ssl(host: str, dias_aviso: int, dias_critico: int) -> ResultadoCheck:
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(), server_hostname=host) as sock:
            sock.settimeout(12)
            sock.connect((host, 443))
            cert = sock.getpeercert()
        expira = _parse_ssl_date(cert['notAfter'])
        dias = _dias_restantes(expira)
        detalhe = f'válido até {expira.strftime("%d/%m/%Y")} ({dias} dias)'
        if dias < 0:
            return ResultadoCheck(f'SSL {host}', 'CRITICO', f'EXPIRADO — {detalhe}')
        if dias <= dias_critico:
            return ResultadoCheck(f'SSL {host}', 'CRITICO', f'vence em {dias} dias — {detalhe}')
        if dias <= dias_aviso:
            return ResultadoCheck(f'SSL {host}', 'AVISO', detalhe)
        return ResultadoCheck(f'SSL {host}', 'OK', detalhe)
    except Exception as exc:
        return ResultadoCheck(f'SSL {host}', 'CRITICO', f'falha: {exc}')


def checar_http(nome: str, url: str) -> ResultadoCheck:
    try:
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'ADCapital-Alertas/1.0', 'Accept': '*/*'},
        )
        with urllib.request.urlopen(req, timeout=25) as resp:
            if resp.status == 200:
                return ResultadoCheck(nome, 'OK', f'{url} — status 200')
            return ResultadoCheck(
                nome, 'CRITICO', f'{url} — status inesperado {resp.status}',
            )
    except urllib.error.HTTPError as exc:
        if exc.code in (401, 403, 404) and 'health' in url:
            return ResultadoCheck(nome, 'OK', f'{url} — respondeu ({exc.code})')
        return ResultadoCheck(nome, 'CRITICO', f'{url} — HTTP {exc.code}')
    except Exception as exc:
        return ResultadoCheck(
            nome,
            'CRITICO',
            f'{url} — indisponível (serviço suspenso ou cold start?) — {exc}',
        )


def _carregar_vencimentos() -> list[dict]:
    raw = os.environ.get('ALERTAS_VENCIMENTOS', '').strip()
    if raw:
        return json.loads(raw)
    path = BASE_DIR / 'docs' / 'alertas-vencimentos.json'
    if path.exists():
        return json.loads(path.read_text(encoding='utf-8'))
    return []


def checar_vencimentos_manuais(dias_aviso_padrao: int) -> list[ResultadoCheck]:
    resultados = []
    for item in _carregar_vencimentos():
        nome = item.get('servico', 'Serviço')
        venc = item.get('vencimento')
        notas = item.get('notas', '')
        dias_aviso = int(item.get('dias_aviso', dias_aviso_padrao) or dias_aviso_padrao)
        if not venc:
            resultados.append(
                ResultadoCheck(
                    f'Renovação {nome}',
                    'OK',
                    f'sem data cadastrada — {notas}' if notas else 'monitoramento automático',
                )
            )
            continue
        try:
            expira = datetime.strptime(venc, '%Y-%m-%d').replace(tzinfo=timezone.utc)
        except ValueError:
            resultados.append(
                ResultadoCheck(f'Renovação {nome}', 'AVISO', f'data inválida: {venc}'),
            )
            continue
        dias = _dias_restantes(expira)
        detalhe = f'vencimento {expira.strftime("%d/%m/%Y")} ({dias} dias). {notas}'.strip()
        if dias < 0:
            resultados.append(ResultadoCheck(f'Renovação {nome}', 'CRITICO', f'VENCIDO — {detalhe}'))
        elif dias <= 7:
            resultados.append(ResultadoCheck(f'Renovação {nome}', 'CRITICO', detalhe))
        elif dias <= dias_aviso:
            resultados.append(ResultadoCheck(f'Renovação {nome}', 'AVISO', detalhe))
        else:
            resultados.append(ResultadoCheck(f'Renovação {nome}', 'OK', detalhe))
    return resultados


def checar_banco() -> ResultadoCheck:
    url = os.environ.get('DATABASE_URL', '').strip()
    if not url:
        return ResultadoCheck('Supabase (DATABASE_URL)', 'OK', 'não configurado neste ambiente')
    try:
        from django.db import connection

        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
        return ResultadoCheck('Supabase (PostgreSQL)', 'OK', 'conexão OK')
    except Exception as exc:
        return ResultadoCheck('Supabase (PostgreSQL)', 'CRITICO', f'falha na conexão: {exc}')


def gerar_relatorio(
    *,
    incluir_banco: bool = False,
    dias_aviso_ssl: int = 30,
    dias_critico_ssl: int = 7,
    dias_aviso_renovacao: int = 30,
) -> RelatorioInfra:
    rel = RelatorioInfra(gerado_em=datetime.now(timezone.utc))

    for host in SSL_HOSTS:
        rel.resultados.append(checar_ssl(host, dias_aviso_ssl, dias_critico_ssl))

    for nome, url in HTTP_CHECKS:
        rel.resultados.append(checar_http(nome, url))

    rel.resultados.extend(checar_vencimentos_manuais(dias_aviso_renovacao))

    if incluir_banco:
        rel.resultados.append(checar_banco())

    resend = os.environ.get('RESEND_API_KEY', '').strip()
    if not resend:
        rel.resultados.append(
            ResultadoCheck(
                'Resend (envio de alertas)',
                'AVISO',
                'RESEND_API_KEY ausente — e-mail não será enviado',
            )
        )
    else:
        rel.resultados.append(
            ResultadoCheck('Resend (envio de alertas)', 'OK', 'API key configurada'),
        )

    return rel


def formatar_relatorio_texto(rel: RelatorioInfra) -> str:
    linhas = [
        'AD Capital — Alertas de infraestrutura',
        f'Gerado em: {rel.gerado_em.astimezone().strftime("%d/%m/%Y %H:%M")}',
        '',
    ]
    for nivel in ('CRITICO', 'AVISO', 'OK'):
        items = [r for r in rel.resultados if r.nivel == nivel]
        if not items:
            continue
        linhas.append(f'--- {nivel} ({len(items)}) ---')
        for r in items:
            linhas.append(f'• [{r.nivel}] {r.nome}: {r.detalhe}')
        linhas.append('')
    if not rel.tem_problema:
        linhas.append('Todos os checks automáticos estão OK.')
        linhas.append('Atualize docs/alertas-vencimentos.json com datas de renovação quando souber.')
    linhas.append('')
    linhas.append('Dashboards: Render, Cloudflare, Supabase, Registro.br, Cloudinary.')
    return '\n'.join(linhas)


def destinatarios_alertas() -> list[str]:
    raw = os.environ.get(
        'ALERTAS_EMAIL_PARA',
        'igrejaadcapital@gmail.com',
    )
    return [e.strip() for e in raw.split(',') if e.strip()]
