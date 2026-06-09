import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import LandingPage from '../features/site/LandingPage';
import { isNativeApp } from '../mobile/capacitorSetup';
import { PATHS } from './paths';
import { PostAuthRedirect } from './guards';

function isLandingHost() {
  const host = window.location.hostname.toLowerCase();
  return host === 'adcapitaligreja.com.br' || host === 'www.adcapitaligreja.com.br';
}

function isCadastroHost() {
  return window.location.hostname.toLowerCase().startsWith('cadastro.');
}

function isSystemHost() {
  const host = window.location.hostname.toLowerCase();
  return host.startsWith('sistema.') || host === 'localhost' || host === '127.0.0.1';
}

export default function RootEntry() {
  const { isAuthenticated, sessionLoading } = useAuth();

  if (sessionLoading) return null;

  if (isNativeApp()) {
    return isAuthenticated ? (
      <PostAuthRedirect />
    ) : (
      <Navigate to={PATHS.login} replace />
    );
  }

  if (isCadastroHost()) {
    return <Navigate to={PATHS.cadastro} replace />;
  }

  if (isAuthenticated) {
    return <PostAuthRedirect />;
  }

  if (isLandingHost()) {
    return <LandingPage />;
  }

  if (isSystemHost()) {
    return <Navigate to={PATHS.login} replace />;
  }

  return <LandingPage />;
}
