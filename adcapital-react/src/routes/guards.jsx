import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthProvider';
import { isValidToken, PATHS } from './paths';

export function PostAuthRedirect() {
  const { user } = useAuth();
  const dest = user?.role === 'MEMBRO' ? PATHS.portal.mensagens : PATHS.admin.inicio;
  return <Navigate to={dest} replace />;
}

export function RequireAuth() {
  const { token } = useAuth();
  const location = useLocation();

  if (!isValidToken(token)) {
    return <Navigate to={PATHS.login} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function GuestOnly() {
  const { token } = useAuth();
  if (isValidToken(token)) {
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
