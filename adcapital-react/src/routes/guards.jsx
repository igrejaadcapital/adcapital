import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { PATHS } from './paths';

export function PostAuthRedirect() {
  const { user } = useAuth();
  const dest = user?.role === 'MEMBRO' ? PATHS.portal.mensagens : PATHS.admin.inicio;
  return <Navigate to={dest} replace />;
}

export function RequireAuth() {
  const { isAuthenticated, sessionLoading } = useAuth();
  const location = useLocation();

  if (sessionLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to={PATHS.login} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function GuestOnly() {
  const { isAuthenticated, sessionLoading } = useAuth();
  if (sessionLoading) return null;
  if (isAuthenticated) {
    return <PostAuthRedirect />;
  }
  return <Outlet />;
}

export function RoleGate({ roles, fallback = PATHS.admin.inicio, children }) {
  const { user } = useAuth();
  if (!roles.includes(user?.role)) {
    return <Navigate to={fallback} replace />;
  }
  return children ?? <Outlet />;
}
