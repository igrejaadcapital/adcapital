import { useOutletContext } from 'react-router-dom';
import MemberPortal from '../features/portal/MemberPortal';
import { PORTAL_TAB_FROM_PATH, PATHS } from './paths';

function PortalPage({ tab }) {
  return <MemberPortal abaAtiva={tab} />;
}

export function PortalMensagensPage() {
  return <PortalPage tab="mensagens" />;
}

export function PortalAgendaPage() {
  return <PortalPage tab="agenda" />;
}

export function PortalPerfilPage() {
  return <PortalPage tab="perfil" />;
}

/** Fallback: deriva aba da rota atual (útil para testes e deep links). */
export function PortalPageFromPath() {
  const { pathname } = useOutletContext() || { pathname: PATHS.portal.mensagens };
  const tab = PORTAL_TAB_FROM_PATH[pathname] || 'mensagens';
  return <PortalPage tab={tab} />;
}
