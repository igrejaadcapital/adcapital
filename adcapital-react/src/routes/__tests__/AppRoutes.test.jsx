import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import AppRoutes from '../AppRoutes';

vi.mock('../../features/auth/Login', () => ({
  default: () => <div data-testid="login-page">Login</div>,
}));

vi.mock('../../features/membros/AutoCadastroPage', () => ({
  default: () => <div data-testid="cadastro-page">Cadastro</div>,
}));

vi.mock('../../features/site/LandingPage', () => ({
  default: () => <div data-testid="landing-page">Landing</div>,
}));

vi.mock('../../features/auth/AuthProvider', () => ({
  useAuth: () => ({
    token: null,
    user: null,
    isAuthenticated: false,
    sessionLoading: false,
    logout: vi.fn(),
  }),
}));

vi.mock('../AdminLayout', () => ({
  default: () => <div data-testid="admin-layout">Admin</div>,
}));

vi.mock('../PortalLayout', () => ({
  default: () => <div data-testid="portal-layout">Portal</div>,
}));

describe('AppRoutes', () => {
  beforeEach(() => {
    vi.stubGlobal('location', {
      ...window.location,
      hostname: 'localhost',
      pathname: '/',
      hash: '',
      search: '',
    });
  });

  it('renderiza login em /login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes isWakingUp={false} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('renderiza cadastro em /cadastro', () => {
    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <AppRoutes isWakingUp={false} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('cadastro-page')).toBeInTheDocument();
  });
});
