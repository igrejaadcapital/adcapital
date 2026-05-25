import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import membroService from '../../api/membroService';
import { membrosKeys } from '../../api/queryClient';

async function fetchMembrosBundle() {
  const [m, f, g] = await Promise.all([
    membroService.listar(),
    membroService.getFuncoes(),
    membroService.getGraus(),
  ]);
  const listaMembros = Array.isArray(m.data) ? m.data : m.data.results || [];
  return { membros: listaMembros, funcoes: f.data, graus: g.data };
}

export function useMembros() {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState('');

  const query = useQuery({
    queryKey: membrosKeys.lista,
    queryFn: fetchMembrosBundle,
  });

  const membros = query.data?.membros ?? [];
  const funcoes = query.data?.funcoes ?? [];
  const graus = query.data?.graus ?? [];

  const membrosFiltrados = membros.filter(
    (m) =>
      m.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      m.funcao?.toLowerCase().includes(busca.toLowerCase())
  );

  const carregarDados = () =>
    queryClient.invalidateQueries({ queryKey: membrosKeys.lista });

  return {
    membros,
    membrosFiltrados,
    busca,
    setBusca,
    funcoes,
    graus,
    carregarDados,
    loading: query.isPending || query.isFetching,
    error: query.isError,
  };
}
