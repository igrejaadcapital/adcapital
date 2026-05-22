import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from './paths';

const HASH_TO_PATH = [
  ['cadastro', PATHS.cadastro],
  ['portal', PATHS.portal.mensagens],
  ['admin', PATHS.admin.inicio],
  ['sistema', PATHS.login],
  ['site', PATHS.site],
];

/**
 * Redireciona URLs antigas (#/cadastro, #/admin, etc.) para rotas do React Router.
 */
export default function HashLegacyRedirect({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    if (!hash || hash === '#/' || hash === '#') return;

    for (const [key, path] of HASH_TO_PATH) {
      if (hash.includes(key)) {
        navigate(`${path}${window.location.search}`, { replace: true });
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        break;
      }
    }
  }, [navigate]);

  return children;
}
