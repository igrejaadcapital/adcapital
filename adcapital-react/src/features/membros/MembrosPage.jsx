import React, { useState } from 'react';
import StatusView from '../../shared/components/StatusView';
import Header from '../../shared/components/Header';
import ConfirmDialog from '../../shared/components/ConfirmDialog';
import MembroCard from './MembroCard';
import MembroTable from './MembroTable';
import CadastroMainFormModal from './ModalCadastro/CadastroMainFormModal';
import membroService from '../../api/membroService';
import { useMembros } from './useMembros';
import { formatCpf, onlyDigits } from '../../shared/lib/masks';

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
  const [membroParaExcluir, setMembroParaExcluir] = useState(null);

  const baixarTermoLgpd = async () => {
    try {
      const response = await membroService.baixarTermoLgpdEmBranco();
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'termo_lgpd_em_branco.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Não foi possível baixar o termo LGPD em branco.');
    }
  };

  const abrirNovo = () => {
    setMembroParaEditar(null);
    setMostrarModal(true);
  };

  const abrirEdicao = (m) => {
    setMembroParaEditar(m);
    setMostrarModal(true);
  };

  const solicitarExcluir = (membro) => {
    setMembroParaExcluir(membro);
  };

  const confirmarExcluir = async () => {
    if (!membroParaExcluir) return;
    setDeletandoId(membroParaExcluir.id);
    try {
      await membroService.excluir(membroParaExcluir.id);
      await carregarDados();
      setMembroParaExcluir(null);
    } catch (err) {
      console.error(err);
      alert('Erro técnico ao excluir.');
    } finally {
      setDeletandoId(null);
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
          onBaixarTermoLgpd={baixarTermoLgpd}
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
                onDelete={() => solicitarExcluir(m)}
                deletandoId={deletandoId}
              />
            ))}
          </div>
        ) : (
          <MembroTable 
            membros={membrosFiltrados} 
            onEdit={abrirEdicao} 
            onDelete={solicitarExcluir} 
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

      <ConfirmDialog
        open={Boolean(membroParaExcluir)}
        title="Excluir membro permanentemente?"
        message={
          membroParaExcluir
            ? `Você está prestes a excluir:\n\n${membroParaExcluir.nome}\nCPF: ${formatCpf(membroParaExcluir.cpf)}\n\nEsta ação não pode ser desfeita pelo sistema. Para confirmar, digite o CPF abaixo.`
            : ''
        }
        requireText={membroParaExcluir?.cpf ? formatCpf(membroParaExcluir.cpf) : ''}
        requireTextLabel="Digite o CPF completo para confirmar"
        normalizeRequireText={onlyDigits}
        confirmLabel="Sim, excluir definitivamente"
        cancelLabel="Cancelar"
        danger
        loading={deletandoId === membroParaExcluir?.id}
        onConfirm={confirmarExcluir}
        onCancel={() => !deletandoId && setMembroParaExcluir(null)}
      />
    </>
  );
}

