# -*- coding: utf-8 -*-
"""
Camada de compatibilidade — importe de membros.api.* em código novo.

Este arquivo reexporta as views para não quebrar imports existentes
(membros.urls, adcapitalcore.urls, testes).
"""
from membros.api.auth import (
    CustomTokenObtainPairSerializer,
    CustomTokenObtainPairView,
    health_check,
    ping_view,
)
from membros.api.configuracao import (
    ConfiguracaoPortalViewSet,
    ConfiguracaoSiteViewSet,
    FotoGaleriaViewSet,
)
from membros.api.cron import resetar_senhas_em_massa, verificar_aniversarios
from membros.api.funcoes import adicionar_funcao, buscar_opcoes_funcao, excluir_funcao
from membros.api.membros_admin import (
    AutoCadastroMembroView,
    MembroPagination,
    MembroViewSet,
    download_termo_lgpd,
)
from membros.api.portal import ComentarioPalavraViewSet, DevocionalViewSet, MeusDadosView
from membros.api.publico import (
    buscar_configuracao_publica,
    buscar_membros_autocomplete_publico,
    buscar_opcoes_parentesco,
    curtir_palavra,
    init_publico,
    init_site,
    ultimo_video_youtube,
    verificar_resposta_portal,
)
from membros.api.usuarios import ResetarSenhaView, TrocarSenhaView, UsuariosView
from membros.services.parentesco_service import salvar_parentescos as _salvar_parentescos_direto

__all__ = [
    'CustomTokenObtainPairSerializer',
    'CustomTokenObtainPairView',
    'ping_view',
    'health_check',
    'init_publico',
    'init_site',
    'curtir_palavra',
    'ultimo_video_youtube',
    'buscar_opcoes_funcao',
    'excluir_funcao',
    'adicionar_funcao',
    'buscar_opcoes_parentesco',
    'buscar_configuracao_publica',
    'verificar_resposta_portal',
    'ConfiguracaoPortalViewSet',
    'ConfiguracaoSiteViewSet',
    'FotoGaleriaViewSet',
    'MembroPagination',
    'MembroViewSet',
    'AutoCadastroMembroView',
    'download_termo_lgpd',
    'buscar_membros_autocomplete_publico',
    'MeusDadosView',
    'UsuariosView',
    'TrocarSenhaView',
    'ResetarSenhaView',
    'ComentarioPalavraViewSet',
    'DevocionalViewSet',
    'verificar_aniversarios',
    'resetar_senhas_em_massa',
    '_salvar_parentescos_direto',
]
