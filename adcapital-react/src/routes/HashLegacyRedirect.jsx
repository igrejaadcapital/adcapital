import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from './paths';

/** Hashes antigos (#/admin, #/portal) — não confundir com rotas atuais (#/admin/estatisticas). */
export function resolveLegacyHashRedirect(hash) {
  if (!hash || hash === '#/' || hash === '#') return null;

  const h = hash.toLowerCase();
  const rules = [
    { test: (x) => x === '#/cadastro' || x.startsWith('#/cadastro?'), path: PATHS.cadastro },
    { test: (x) => x === '#/portal' || x === '#/portal/', path: PATHS.portal.mensagens },
    { test: (x) => x === '#/admin' || x === '#/admin/', path: PATHS.admin.inicio },
    { test: (x) => x === '#/sistema' || x.startsWith('#/sistema'), path: PATHS.login },
    { test: (x) => x === '#/site' || x === '#/site/', path: PATHS.site },
  ];

  for (const { test, path } of rules) {
    if (test(h)) return path;
  }
  return null;
}

/**
 * Redireciona URLs antigas (#/cadastro, #/admin, etc.) para rotas do React Router.
 * Em produção usamos HashRouter (#/admin/...); este componente não altera a navegação.
 */
export default function HashLegacyRedirect({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const target = resolveLegacyHashRedirect(window.location.hash);
    if (!target) return;

    navigate(`${target}${window.location.search}`, { replace: true });
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, [navigate]);

  return children;
}
