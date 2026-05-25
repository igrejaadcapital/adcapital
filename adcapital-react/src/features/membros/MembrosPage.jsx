import React, { useState } from 'react';
import StatusView from '../../shared/components/StatusView';
import Header from '../../shared/components/Header';
import MembroCard from './MembroCard';
import MembroTable from './MembroTable';
import CadastroMainFormModal from './ModalCadastro/CadastroMainFormModal';
import membroService from '../../api/membroService';
import { useMembros } from './useMembros';

export default function MembrosPage() {
  const { 
    membros, 
    membrosFiltrados, 
    busca, 
    setBusca, 
    funcoes, 
    graus, 
    carregarDados, 
    loading, 
    error 
  } = useMembros();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [membroParaEditar, setMembroParaEditar] = useState(null);
  const [viewType, setViewType] = useState('list'); // 'list' ou 'grid'
  const [deletandoId, setDeletandoId] = useState(null);

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
      setDeletandoId(id);
      try {
        await membroService.excluir(id);
        await carregarDados();
      } catch (err) {
        console.error(err);
        alert('Erro técnico ao excluir.');
      } finally {
        setDeletandoId(null);
      }
    }
  };

  if (error && !loading) {
    return (
      <StatusView 
        error={error} 
        onRetry={carregarDados} 
        message="Erro ao carregar membros"
        subMessage="O servidor pode estar demorando a responder devido à inatividade (Cold Start)."
      />
    );
  }

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
        <StatusView loading={loading} />
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
            onClick={() => setViewType('list')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              viewType === 'list'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-400 hover:text-blue-900 hover:bg-slate-100'
            }`}
          >
            📜 Lista
          </button>
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
        </div>

        {viewType === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[...membrosFiltrados].sort((a,b) => a.nome.localeCompare(b.nome)).map((m) => (
              <MembroCard
                key={m.id}
                m={m}
                graus={graus}
                onEdit={() => abrirEdicao(m)}
                onDelete={() => handleExcluir(m.id)}
                deletandoId={deletandoId}
              />
            ))}
          </div>
        ) : (
          <MembroTable 
            membros={membrosFiltrados} 
            onEdit={abrirEdicao} 
            onDelete={handleExcluir} 
            deletandoId={deletandoId}
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

