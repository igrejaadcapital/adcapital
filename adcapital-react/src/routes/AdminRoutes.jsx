import { useNavigate } from 'react-router-dom';
import DashboardHome from '../components/Apresentacao/DashboardHome';
import MembrosPage from '../components/Membros/MembrosPage';
import FinanceiroMain from '../components/Financeiro/FinanceiroMain';
import AgendaPage from '../components/Agenda/AgendaPage';
import AnalyticsPage from '../components/Analytics/AnalyticsPage';
import SettingsPage from '../components/Configuracoes/SettingsPage';
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
