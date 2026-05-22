import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthProvider';
import { PATHS } from './paths';

export default function PortalLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (user?.role !== 'MEMBRO') {
    return <Navigate to={PATHS.admin.inicio} replace />;
  }

  const linkClass = ({ isActive }) =>
    `pb-1 transition-all ${
      isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'
    }`;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 p-4 sticky top-0 z-40 shadow-sm flex items-center justify-between">
        <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo AD Capital" className="h-8 w-auto object-contain rounded-sm" />
            <span className="font-black text-slate-800 tracking-tighter text-lg">AD CAPITAL</span>
          </div>
          <div className="flex gap-6 font-black text-[10px] uppercase tracking-[0.2em]">
            <NavLink to={PATHS.portal.mensagens} className={linkClass}>
              Mensagens
            </NavLink>
            <NavLink to={PATHS.portal.agenda} className={linkClass}>
              Agenda
            </NavLink>
            <NavLink to={PATHS.portal.perfil} className={linkClass}>
              Meu Perfil
            </NavLink>
            <button
              type="button"
              onClick={logout}
              className="ml-4 font-black uppercase text-rose-500 hover:text-rose-600 transition-colors border border-rose-100 hover:border-rose-200 bg-rose-50 px-3 py-1 rounded"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4">
        <Outlet context={{ pathname: location.pathname }} />
      </main>
    </div>
  );
}
