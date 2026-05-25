import api from './config';

/** Registro interno (banco) — não substitui o Google Analytics. */
export function trackInternalAcesso(pagina) {
  if (!['SITE', 'PORTAL', 'SISTEMA'].includes(pagina)) return;
  api.post('/analytics/track/', { pagina }).catch(() => {});
}
