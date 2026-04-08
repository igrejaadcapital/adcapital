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

function MainApp({ logout }) {
  const { membros, membrosFiltrados, busca, setBusca, funcoes, graus, carregarDados, loading, error } = useMembros();
  const [telaAtiva, setTelaAtiva] = useState('home');

  const {
    transacoes,
    transacoesFiltradas,
    buscaTexto, setBuscaTexto,
    buscaMes, setBuscaMes,
    atualizarTransacoes,
    totalEntradas,
    totalSaidas,
    saldoAtual,
    loading: loadingFinanceiro,
    error: errorFinanceiro
  } = useFinanceiro();

  const {
    categoriasEntrada,
    categoriasSaida,
    adicionarCategoriaEntrada,
    adicionarCategoriaSaida,
  } = useCategoriasFinanceiras();

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 p-4 sticky top-0 z-40 shadow-sm flex items-center justify-between">
        <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <img src="/logo.png" alt="Logo AD Capital" className="h-8 w-auto object-contain rounded-sm" />
             <span className="font-black text-slate-800 tracking-tighter text-lg">AD CAPITAL</span>
          </div>
          <div className="flex gap-6 font-black text-[10px] uppercase tracking-[0.2em]">
          <button onClick={() => setTelaAtiva('home')} className={`pb-1 transition-all ${telaAtiva === 'home' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Início</button>
          <button onClick={() => setTelaAtiva('membros')} className={`pb-1 transition-all ${telaAtiva === 'membros' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Membros</button>
          <button onClick={() => setTelaAtiva('financeiro')} className={`pb-1 transition-all ${telaAtiva === 'financeiro' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Financeiro</button>
          <button onClick={() => setTelaAtiva('agenda')} className={`pb-1 transition-all ${telaAtiva === 'agenda' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Agenda</button>
          <button onClick={() => setTelaAtiva('config')} className={`pb-1 transition-all ${telaAtiva === 'config' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Configurações</button>
          
          <button onClick={logout} className="ml-4 font-black uppercase text-rose-500 hover:text-rose-600 transition-colors border border-rose-100 hover:border-rose-200 bg-rose-50 px-3 py-1 rounded">Sair</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4">
        {telaAtiva === 'home' && (
          <DashboardHome
            totalMembros={membros.length}
            saldoBancario={saldoAtual}
            entradas={totalEntradas}
            saidas={totalSaidas}
            irParaMembros={() => setTelaAtiva('membros')}
            irParaFinanceiro={() => setTelaAtiva('financeiro')}
            loading={loading}
            error={error}
            retry={carregarDados}
          />
        )}

        {telaAtiva === 'membros' && (
          <MembrosPage
            membros={membros}
            membrosFiltrados={membrosFiltrados}
            busca={busca}
            setBusca={setBusca}
            funcoes={funcoes}
            graus={graus}
            carregarDados={carregarDados}
            loading={loading}
            error={error}
          />
        )}

        {telaAtiva === 'financeiro' && (
          <FinanceiroMain
            transacoes={transacoes}
            transacoesFiltradas={transacoesFiltradas}
            buscaTexto={buscaTexto}
            setBuscaTexto={setBuscaTexto}
            buscaMes={buscaMes}
            setBuscaMes={setBuscaMes}
            atualizarTransacoes={atualizarTransacoes}
            totalEntradas={totalEntradas}
            totalSaidas={totalSaidas}
            saldoAtual={saldoAtual}
            categoriasEntrada={categoriasEntrada}
            categoriasSaida={categoriasSaida}
            adicionarCategoriaEntrada={adicionarCategoriaEntrada}
            adicionarCategoriaSaida={adicionarCategoriaSaida}
            loading={loadingFinanceiro}
            error={errorFinanceiro}
          />
        )}

        {telaAtiva === 'agenda' && (
          <AgendaPage />
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
  const [, setHash] = useState(window.location.hash);

  useEffect(() => {
    // Log para Debug - Veja isso no console do navegador (F12)
    console.log("Versão do App: SiteInstitucional-v1.4");
    console.log("URL Atual:", window.location.href);

    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  const currentHash = window.location.hash.toLowerCase();
  const currentHost = window.location.hostname.toLowerCase();

  // 1. Detecção de Portal de Cadastro (Prioridade para o subdomínio ou hash específico)
  const isPortal = 
    currentHost.startsWith('cadastro.') || 
    currentHash.includes('cadastro');

  if (isPortal) {
    return <AutoCadastroPage />;
  }

  // 2. Detecção de Site Institucional (Landing Page)
  // Só entra aqui se for o domínio principal EXATO ou se for forçado via hash /#/site
  const isLandingPage = 
    currentHost === 'adcapitaligreja.com.br' || 
    currentHost === 'www.adcapitaligreja.com.br' ||
    currentHash.includes('site');

  if (isLandingPage) {
    return <LandingPage />;
  }

  // 3. Sistema Administrativo (Exige Login)
  if (!token) {
    // Se o usuário estiver no subdomínio sistema, mostra login. 
    // Caso contrário (domínios genéricos ou IP), mostra o site por segurança/SEO.
    if (currentHost.startsWith('sistema.')) {
       return <Login />;
    }
    return <LandingPage />;
  }

  return <MainApp logout={logout} />;
}

export default App;