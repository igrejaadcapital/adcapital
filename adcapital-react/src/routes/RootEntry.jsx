import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthProvider';
import LandingPage from '../components/SitePublico/LandingPage';
import { isValidToken, PATHS } from './paths';
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
  const { token } = useAuth();

  if (isCadastroHost()) {
    return <Navigate to={PATHS.cadastro} replace />;
  }

  if (isValidToken(token)) {
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
