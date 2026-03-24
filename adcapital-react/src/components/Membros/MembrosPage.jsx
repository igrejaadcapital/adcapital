import { useState } from 'react';
import Header from '../Header';
import MembroCard from './MembroCard';
import CadastroMainFormModal from './ModalCadastro/CadastroMainFormModal';
import { membroService } from '../../api/membroService';

export default function MembrosPage({
  membros,
  membrosFiltrados,
  busca,
  setBusca,
  funcoes,
  graus,
  carregarDados,
}) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [membroParaEditar, setMembroParaEditar] = useState(null);

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

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Header
          busca={busca}
          setBusca={setBusca}
          totalOriginal={membros.length}
          totalFiltrado={membrosFiltrados.length}
          onNovo={abrirNovo}
        />
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

