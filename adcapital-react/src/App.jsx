import { useState, useEffect } from 'react'
import { useMembros } from './components/Membros/useMembros'
import MembrosPage from './components/Membros/MembrosPage'
import DashboardHome from './components/Apresentacao/DashboardHome'
import FinanceiroMain from './components/Financeiro/FinanceiroMain'
import { useCategoriasFinanceiras } from './components/Financeiro/useCategoriasFinanceiras'
import { useFinanceiro } from './components/Financeiro/useFinanceiro'
import AgendaPage from './components/Agenda/AgendaPage'
import SettingsPage from './components/Configuracoes/SettingsPage'
import Login from './components/Auth/Login'
import { useAuth } from './components/Auth/AuthProvider'
import AutoCadastroPage from './components/Membros/AutoCadastroPage'
import LandingPage from './components/SitePublico/LandingPage'
import AnalyticsPage from './components/Analytics/AnalyticsPage'
import MemberPortal from './components/Membros/Portal/MemberPortal'
import { useDashboard } from './hooks/useDashboard'
import api from './api/config'
import { initializeGA, trackPageView } from './hooks/useAnalytics'

function MainApp({ logout }) {
  const { user } = useAuth();
  const [telaAtiva, setTelaAtiva] = useState(user?.role === 'MEMBRO' ? 'mensagens' : 'home');

  useEffect(() => {
    if (user?.role === 'MEMBRO') return; // Rastreamento do portal é feito no MemberPortal.jsx

    const adminPages = {
      home: { path: '/admin/inicio', title: 'AD Capital - Início' },
      membros: { path: '/admin/membros', title: 'AD Capital - Gestão de Membros' },
      financeiro: { path: '/admin/financeiro', title: 'AD Capital - Gestão Financeira' },
      agenda: { path: '/admin/agenda', title: 'AD Capital - Gestão da Agenda' },
      analytics: { path: '/admin/estatisticas', title: 'AD Capital - Inteligência de Dados' },
      config: { path: '/admin/configuracoes', title: 'AD Capital - Configurações' }
    };

    const currentPage = adminPages[telaAtiva];
    if (currentPage) {
      trackPageView(currentPage.path, currentPage.title);
    }
  }, [telaAtiva, user?.role]);


  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 p-4 sticky top-0 z-40 shadow-sm flex items-center justify-between">
        <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <img src="/logo.png" alt="Logo AD Capital" className="h-8 w-auto object-contain rounded-sm" />
             <span className="font-black text-slate-800 tracking-tighter text-lg">AD CAPITAL</span>
          </div>
          <div className="flex gap-6 font-black text-[10px] uppercase tracking-[0.2em]">
          {user?.role === 'MEMBRO' ? (
            <>
              <button onClick={() => setTelaAtiva('mensagens')} className={`pb-1 transition-all ${telaAtiva === 'mensagens' || telaAtiva === 'portal' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Mensagens</button>
              <button onClick={() => setTelaAtiva('agenda')} className={`pb-1 transition-all ${telaAtiva === 'agenda' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Agenda</button>
              <button onClick={() => setTelaAtiva('perfil')} className={`pb-1 transition-all ${telaAtiva === 'perfil' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Meu Perfil</button>
            </>
          ) : (
            <>
              <button onClick={() => setTelaAtiva('home')} className={`pb-1 transition-all ${telaAtiva === 'home' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Início</button>
              
              {(user?.role === 'ADMIN' || user?.role === 'SECRETARIO') && (
                <button onClick={() => setTelaAtiva('membros')} className={`pb-1 transition-all ${telaAtiva === 'membros' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Membros</button>
              )}

              {(user?.role === 'ADMIN' || user?.role === 'TESOUREIRO') && (
                <button onClick={() => setTelaAtiva('financeiro')} className={`pb-1 transition-all ${telaAtiva === 'financeiro' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Financeiro</button>
              )}

              <button onClick={() => setTelaAtiva('agenda')} className={`pb-1 transition-all ${telaAtiva === 'agenda' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Agenda</button>
              <button onClick={() => setTelaAtiva('analytics')} className={`pb-1 transition-all ${telaAtiva === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Estatísticas</button>
              
              {user?.role === 'ADMIN' && (
                <button onClick={() => setTelaAtiva('config')} className={`pb-1 transition-all ${telaAtiva === 'config' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Configurações</button>
              )}
            </>
          )}
          
          <button onClick={logout} className="ml-4 font-black uppercase text-rose-500 hover:text-rose-600 transition-colors border border-rose-100 hover:border-rose-200 bg-rose-50 px-3 py-1 rounded">Sair</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4">
        {(telaAtiva === 'portal' || telaAtiva === 'mensagens' || telaAtiva === 'perfil' || (user?.role === 'MEMBRO' && telaAtiva === 'agenda')) && (
          <MemberPortal abaAtiva={telaAtiva} />
        )}
        {telaAtiva === 'home' && (
          <DashboardHome
            irParaMembros={() => setTelaAtiva('membros')}
            irParaFinanceiro={() => setTelaAtiva('financeiro')}
          />
        )}

        {telaAtiva === 'membros' && (
          <MembrosPage />
        )}

        {telaAtiva === 'financeiro' && (
          <FinanceiroMain />
        )}

        {telaAtiva === 'agenda' && user?.role !== 'MEMBRO' && (
          <AgendaPage />
        )}

        {telaAtiva === 'analytics' && (
          <AnalyticsPage />
        )}

        {telaAtiva === 'config' && (
          <SettingsPage />
        )}
      </main>
    </div>
  )
}

function App() {
  const { token, logout } = useAuth();
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [, setHash] = useState(window.location.hash);

  useEffect(() => {
    // Inicializa o Google Analytics
    initializeGA();

    // Log para Debug - Veja isso no console do navegador (F12)
    console.log("Versão do App: SiteInstitucional-v1.6");
    console.log("URL Atual:", window.location.href);

    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Rastreamento da tela de login
  useEffect(() => {
    if (!isValidToken && (isSystemRoute || currentHost === 'localhost')) {
      trackPageView('/login', 'AD Capital - Login');
    }
  }, [isValidToken, isSystemRoute, currentHost]);

  // [WARM-UP LOGIC] - Agressivo com retry para combater Cold Start
  useEffect(() => {
    const warmup = async (attempt = 1) => {
      const maxAttempts = 4;
      const delays = [5000, 15000, 30000, 60000];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'https://api.adcapitaligreja.com.br/api';
        console.log(`[Warm-up] Tentativa ${attempt}/${maxAttempts}...`);
        
        // Se falhar na primeira, sinaliza que está acordando
        if (attempt > 1) setIsWakingUp(true);

        await fetch(`${baseUrl}/ping/`, { signal: controller.signal });
        
        console.log("[Warm-up] Servidor respondeu com sucesso.");
        setIsWakingUp(false);
      } catch (err) {
        if (attempt < maxAttempts) {
          const wait = delays[attempt - 1];
          console.warn(`[Warm-up] Falha (tentativa ${attempt}). Retentando em ${wait/1000}s...`);
          setIsWakingUp(true);
          clearTimeout(timeoutId);
          await new Promise(r => setTimeout(r, wait));
          return warmup(attempt + 1);
        }
        console.warn("[Warm-up] Servidor não respondeu após todas as tentativas.");
      } finally {
        clearTimeout(timeoutId);
      }
    };

    warmup();
    const interval = setInterval(() => warmup(), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  const currentHash = window.location.hash.toLowerCase();
  const currentHost = window.location.hostname.toLowerCase();

  // 1. Sanitização do Token (Evita strings "null" ou "undefined" que quebram o fluxo)
  const isValidToken = token && token !== 'null' && token !== 'undefined' && token.length > 10;
  
  const isPortal = 
    currentHost.startsWith('cadastro.') || 
    currentHash.includes('cadastro');

  const isSystemRoute = 
    currentHost.startsWith('sistema.') || 
    currentHash.includes('portal') || 
    currentHash.includes('admin') || 
    currentHash.includes('sistema');

  if (isPortal) {
    return <AutoCadastroPage />;
  }

  // 2. Detecção de Site Institucional (Landing Page)
  // Só entra aqui se for o domínio principal e NÃO for uma rota de sistema
  const isLandingPage = 
    (currentHost === 'adcapitaligreja.com.br' || 
     currentHost === 'www.adcapitaligreja.com.br' ||
     currentHash.includes('site')) && !isSystemRoute;

  if (isLandingPage) {
    return <LandingPage />;
  }

  // 3. Sistema Administrativo (Exige Login)
  if (!isValidToken) {
    // Se for uma rota de sistema ou localhost, mostra login.
    if (isSystemRoute || currentHost === 'localhost') {
       return <Login isWakingUp={isWakingUp} />;
    }
    return <LandingPage />;
  }

  return <MainApp logout={logout} />;
}

export default App;