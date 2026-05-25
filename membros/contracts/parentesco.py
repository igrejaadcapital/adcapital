"""
Contrato unificado de parentesco (Fase 1.3b).

Escrita (POST/PATCH): campo ``parentescos_novo`` — lista ou JSON string.
Cada item: ``grau`` obrigatório + ``parente_id`` **ou** ``membro_destino`` (equivalentes).

Leitura (GET): campo ``parentes`` — lista com ``id``, ``membro_destino``, ``parente_id``,
``nome_parente``, ``grau``.
"""
import json
from typing import Any


def parse_parentescos_novo(raw: Any) -> list[dict]:
    """Normaliza ``parentescos_novo`` de JSON body, FormData ou lista."""
    if raw is None or raw == '':
        return []
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except json.JSONDecodeError:
            return []
    if not isinstance(raw, list):
        return []
    items = []
    for entry in raw:
        if not isinstance(entry, dict):
            continue
        dest = entry.get('membro_destino') or entry.get('parente_id')
        grau = entry.get('grau')
        if dest and grau:
            items.append({'membro_destino': dest, 'grau': grau})
    return items
