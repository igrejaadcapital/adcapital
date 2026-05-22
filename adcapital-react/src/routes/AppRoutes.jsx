import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from '../components/Auth/Login';
import AutoCadastroPage from '../components/Membros/AutoCadastroPage';
import LandingPage from '../components/SitePublico/LandingPage';
import { trackPageView } from '../hooks/useAnalytics';
import AdminLayout from './AdminLayout';
import PortalLayout from './PortalLayout';
import {
  AdminAgendaPage,
  AdminConfiguracoesPage,
  AdminEstatisticasPage,
  AdminFinanceiroPage,
  AdminInicioPage,
  AdminMembrosPage,
} from './AdminRoutes';
import {
  PortalAgendaPage,
  PortalMensagensPage,
  PortalPerfilPage,
} from './PortalRoutes';
import { GuestOnly, PostAuthRedirect, RequireAuth, RoleGate } from './guards';
import { PATHS } from './paths';
import RootEntry from './RootEntry';

function LoginRoute({ isWakingUp }) {
  return <Login isWakingUp={isWakingUp} />;
}

function LoginAnalytics() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === PATHS.login) {
      trackPageView('/login', 'AD Capital - Login');
    }
  }, [location.pathname]);
  return null;
}

export default function AppRoutes({ isWakingUp }) {
  return (
    <>
      <LoginAnalytics />
      <Routes>
        <Route path={PATHS.cadastro} element={<AutoCadastroPage />} />
        <Route path={PATHS.site} element={<LandingPage />} />

        <Route element={<GuestOnly />}>
          <Route path={PATHS.login} element={<LoginRoute isWakingUp={isWakingUp} />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path={PATHS.portal.root} element={<PortalLayout />}>
            <Route index element={<Navigate to="mensagens" replace />} />
            <Route path="mensagens" element={<PortalMensagensPage />} />
            <Route path="agenda" element={<PortalAgendaPage />} />
            <Route path="perfil" element={<PortalPerfilPage />} />
          </Route>

          <Route path={PATHS.admin.root} element={<AdminLayout />}>
            <Route index element={<Navigate to="inicio" replace />} />
            <Route path="inicio" element={<AdminInicioPage />} />
            <Route
              path="membros"
              element={
                <RoleGate roles={['ADMIN', 'SECRETARIO']}>
                  <AdminMembrosPage />
                </RoleGate>
              }
            />
            <Route
              path="financeiro"
              element={
                <RoleGate roles={['ADMIN', 'TESOUREIRO']}>
                  <AdminFinanceiroPage />
                </RoleGate>
              }
            />
            <Route path="agenda" element={<AdminAgendaPage />} />
            <Route path="estatisticas" element={<AdminEstatisticasPage />} />
            <Route
              path="configuracoes"
              element={
                <RoleGate roles={['ADMIN']}>
                  <AdminConfiguracoesPage />
                </RoleGate>
              }
            />
          </Route>

        </Route>

        <Route path={PATHS.root} element={<RootEntry />} />
        <Route path="*" element={<Navigate to={PATHS.root} replace />} />
      </Routes>
    </>
  );
}
