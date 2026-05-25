import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Calendar, LogOut, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../components/Auth/AuthProvider';
import { PATHS } from './paths';

function portalTabClass({ isActive }) {
  return isActive
    ? 'text-blue-600'
    : 'text-slate-400';
}

export default function PortalLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (user?.role !== 'MEMBRO') {
    return <Navigate to={PATHS.admin.inicio} replace />;
  }

  const desktopLinkClass = ({ isActive }) =>
    `pb-1 transition-all ${
      isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'
    }`;

  const tabs = [
    { to: PATHS.portal.mensagens, label: 'Mensagens', icon: MessageSquare },
    { to: PATHS.portal.agenda, label: 'Agenda', icon: Calendar },
    { to: PATHS.portal.perfil, label: 'Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 pb-4 safe-area-pt sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="Logo AD Capital" className="h-8 w-auto object-contain rounded-sm shrink-0" />
            <span className="font-black text-slate-800 tracking-tighter text-lg truncate">AD CAPITAL</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="hidden md:inline-flex font-black uppercase text-rose-500 hover:text-rose-600 transition-colors border border-rose-100 hover:border-rose-200 bg-rose-50 px-3 py-1 rounded text-[10px] tracking-[0.2em]"
          >
            Sair
          </button>
          <button
            type="button"
            onClick={logout}
            className="md:hidden p-2 text-rose-500"
            aria-label="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
        <nav className="hidden md:flex max-w-6xl mx-auto mt-4 gap-6 font-black text-[10px] uppercase tracking-[0.2em]">
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} className={desktopLinkClass}>
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 pb-24 md:pb-4">
        <Outlet context={{ pathname: location.pathname }} />
      </main>

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 safe-area-pb"
        aria-label="Navegação do portal"
      >
        <div className="flex justify-around items-stretch h-16 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center justify-center gap-0.5 text-[9px] font-black uppercase tracking-wider ${portalTabClass({ isActive })}`
                }
              >
                <Icon size={22} strokeWidth={2.25} />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
