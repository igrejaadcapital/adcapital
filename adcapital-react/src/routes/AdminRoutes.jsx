import { useNavigate } from 'react-router-dom';
import DashboardHome from '../features/dashboard/DashboardHome';
import MembrosPage from '../features/membros/MembrosPage';
import FinanceiroMain from '../features/financeiro/FinanceiroMain';
import AgendaPage from '../features/agenda/AgendaPage';
import AnalyticsPage from '../features/analytics/AnalyticsPage';
import SettingsPage from '../features/configuracoes/SettingsPage';
import { PATHS } from './paths';

export function AdminInicioPage() {
  const navigate = useNavigate();
  return (
    <DashboardHome
      irParaMembros={() => navigate(PATHS.admin.membros)}
      irParaFinanceiro={() => navigate(PATHS.admin.financeiro)}
    />
  );
}

export function AdminMembrosPage() {
  return <MembrosPage />;
}

export function AdminFinanceiroPage() {
  return <FinanceiroMain />;
}

export function AdminAgendaPage() {
  return <AgendaPage />;
}

export function AdminEstatisticasPage() {
  return <AnalyticsPage />;
}

export function AdminConfiguracoesPage() {
  return <SettingsPage />;
}
