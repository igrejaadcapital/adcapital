import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import financeiroService from '../../api/financeiroService';
import { financeiroKeys } from '../../api/queryClient';

async function fetchFinanceiroPainel() {
  const [resTransacoes, resDash] = await Promise.all([
    financeiroService.listar(),
    financeiroService.getDashboard(),
  ]);
  return {
    transacoes: resTransacoes.data,
    dashboard: resDash.data,
  };
}

export function useFinanceiro() {
  const queryClient = useQueryClient();
  const [buscaTexto, setBuscaTexto] = useState('');
  const [buscaMes, setBuscaMes] = useState('');

  const query = useQuery({
    queryKey: financeiroKeys.painel,
    queryFn: fetchFinanceiroPainel,
  });

  const transacoes = query.data?.transacoes ?? [];
  const dashboardData = query.data?.dashboard ?? {
    total_entradas: 0,
    total_saidas: 0,
    saldo_atual: 0,
  };

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter((t) => {
      const termo = buscaTexto.toLowerCase();
      const descricaoEfetiva = t.descricao?.trim() || t.categoria || '';

      const matchTexto =
        descricaoEfetiva.toLowerCase().includes(termo) ||
        (t.categoria || '').toLowerCase().includes(termo);

      const matchMes = buscaMes ? t.data.startsWith(buscaMes) : true;
      return matchTexto && matchMes;
    });
  }, [transacoes, buscaTexto, buscaMes]);

  const atualizarTransacoes = () =>
    queryClient.invalidateQueries({ queryKey: financeiroKeys.painel });

  return {
    transacoes,
    transacoesFiltradas,
    buscaTexto,
    setBuscaTexto,
    buscaMes,
    setBuscaMes,
    atualizarTransacoes,
    totalEntradas: dashboardData.total_entradas,
    totalSaidas: dashboardData.total_saidas,
    saldoAtual: dashboardData.saldo_atual,
    loading: query.isPending || query.isFetching,
    error: query.isError,
  };
}
