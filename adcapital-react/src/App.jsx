import { useState } from 'react'
import { useMembros } from './components/Membros/useMembros'
import MembrosPage from './components/Membros/MembrosPage'
import DashboardHome from './components/Apresentacao/DashboardHome'
import FinanceiroMain from './components/Financeiro/FinanceiroMain'
import { useCategoriasFinanceiras } from './components/Financeiro/useCategoriasFinanceiras'
import { useFinanceiro } from './components/Financeiro/useFinanceiro'

function App() {
  const { membros, membrosFiltrados, busca, setBusca, funcoes, graus, carregarDados } = useMembros();
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
  } = useFinanceiro();

  const {
    categoriasEntrada,
    categoriasSaida,
    adicionarCategoriaEntrada,
    adicionarCategoriaSaida,
  } = useCategoriasFinanceiras();

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 p-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex gap-6 font-black text-[10px] uppercase tracking-[0.2em]">
          <button onClick={() => setTelaAtiva('home')} className={`pb-1 transition-all ${telaAtiva === 'home' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Início</button>
          <button onClick={() => setTelaAtiva('membros')} className={`pb-1 transition-all ${telaAtiva === 'membros' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Membros</button>
          <button onClick={() => setTelaAtiva('financeiro')} className={`pb-1 transition-all ${telaAtiva === 'financeiro' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Financeiro</button>
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
          />
        )}
      </main>
    </div>
  )
}
export default App;