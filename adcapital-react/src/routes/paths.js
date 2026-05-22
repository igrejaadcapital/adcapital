/** Rotas canônicas do SPA (web + base para app mobile). */
export const PATHS = {
  root: '/',
  site: '/site',
  cadastro: '/cadastro',
  login: '/login',
  admin: {
    root: '/admin',
    inicio: '/admin/inicio',
    membros: '/admin/membros',
    financeiro: '/admin/financeiro',
    agenda: '/admin/agenda',
    estatisticas: '/admin/estatisticas',
    configuracoes: '/admin/configuracoes',
  },
  portal: {
    root: '/portal',
    mensagens: '/portal/mensagens',
    agenda: '/portal/agenda',
    perfil: '/portal/perfil',
  },
};

export const ADMIN_ANALYTICS = {
  [PATHS.admin.inicio]: { path: '/admin/inicio', title: 'AD Capital - Início' },
  [PATHS.admin.membros]: { path: '/admin/membros', title: 'AD Capital - Gestão de Membros' },
  [PATHS.admin.financeiro]: { path: '/admin/financeiro', title: 'AD Capital - Gestão Financeira' },
  [PATHS.admin.agenda]: { path: '/admin/agenda', title: 'AD Capital - Gestão da Agenda' },
  [PATHS.admin.estatisticas]: { path: '/admin/estatisticas', title: 'AD Capital - Inteligência de Dados' },
  [PATHS.admin.configuracoes]: { path: '/admin/configuracoes', title: 'AD Capital - Configurações' },
};

export const PORTAL_ANALYTICS = {
  [PATHS.portal.mensagens]: { path: '/portal/mensagens', title: 'AD Capital - Portal (Mensagens)' },
  [PATHS.portal.agenda]: { path: '/portal/agenda', title: 'AD Capital - Portal (Agenda)' },
  [PATHS.portal.perfil]: { path: '/portal/perfil', title: 'AD Capital - Portal (Perfil)' },
};

/** Mapeia abas antigas do MemberPortal para rotas. */
export const PORTAL_TAB_FROM_PATH = {
  [PATHS.portal.mensagens]: 'mensagens',
  [PATHS.portal.agenda]: 'agenda',
  [PATHS.portal.perfil]: 'perfil',
};

export function isValidToken(token) {
  return token && token !== 'null' && token !== 'undefined' && token.length > 10;
}
