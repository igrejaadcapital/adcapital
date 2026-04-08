import { AlertCircle, RefreshCcw, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Header from '../Header';
import MembroCard from './MembroCard';
import MembroTable from './MembroTable';
import CadastroMainFormModal from './ModalCadastro/CadastroMainFormModal';
import membroService from '../../api/membroService';

export default function MembrosPage({
  membros,
  membrosFiltrados,
  busca,
  setBusca,
  funcoes,
  graus,
  carregarDados,
  loading,
  error
}) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [membroParaEditar, setMembroParaEditar] = useState(null);
  const [viewType, setViewType] = useState('grid'); // 'grid' ou 'list'

  const abrirNovo = () => {
    setMembroParaEditar(null);
    setMostrarModal(true);
  };

  const abrirEdicao = (m) => {
    setMembroParaEditar(m);
    setMostrarModal(true);
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Deseja realmente excluir este membro?')) {
      try {
        await membroService.excluir(id);
        await carregarDados();
        alert('Membro excluído com sucesso!');
      } catch (err) {
        alert('Erro técnico ao excluir.');
      }
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2.5rem] border border-rose-100 shadow-xl space-y-6">
        <AlertCircle size={48} className="text-rose-500" />
        <div className="text-center">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Erro ao carregar membros</h2>
          <p className="text-xs font-bold text-slate-400 uppercase mt-2">O servidor pode estar demorando a responder devido à inatividade.</p>
        </div>
        <button 
          onClick={carregarDados}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all"
        >
          <RefreshCcw size={16} /> Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-[2.5rem]">
             <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        )}
        <Header
          busca={busca}
          setBusca={setBusca}
          totalOriginal={membros.length}
          totalFiltrado={membrosFiltrados.length}
          onNovo={abrirNovo}
        />

        {/* Barra de Ações da Lista */}
        <div className="flex justify-start items-center gap-1 bg-white/50 backdrop-blur p-1 rounded-xl border border-slate-200 w-fit">
          <button
            onClick={() => setViewType('grid')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              viewType === 'grid'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-400 hover:text-blue-900 hover:bg-slate-100'
            }`}
          >
            🔲 Grade
          </button>
          <button
            onClick={() => setViewType('list')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              viewType === 'list'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-400 hover:text-blue-900 hover:bg-slate-100'
            }`}
          >
            📜 Lista
          </button>
        </div>

        {viewType === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {membrosFiltrados.map((m) => (
              <MembroCard
                key={m.id}
                m={m}
                graus={graus}
                onEdit={() => abrirEdicao(m)}
                onDelete={() => handleExcluir(m.id)}
              />
            ))}
          </div>
        ) : (
          <MembroTable 
            membros={membrosFiltrados} 
            onEdit={abrirEdicao} 
            onDelete={handleExcluir} 
          />
        )}
      </div>

      {mostrarModal && (
        <CadastroMainFormModal
          membro={membroParaEditar}
          membros={membros}
          funcoes={funcoes}
          graus={graus}
          onClose={() => setMostrarModal(false)}
          onSuccess={carregarDados}
        />
      )}
    </>
  );
}

