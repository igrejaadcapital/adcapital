import { useState, useEffect, useMemo, useCallback } from 'react';
import financeiroService from '../../api/financeiroService';

export function useFinanceiro() {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    total_entradas: 0,
    total_saidas: 0,
    saldo_atual: 0
  });

  const [buscaTexto, setBuscaTexto] = useState('');
  const [buscaMes, setBuscaMes] = useState('');

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const [resTransacoes, resDash] = await Promise.all([
        financeiroService.listar(),
        financeiroService.getDashboard()
      ]);
      setTransacoes(resTransacoes.data);
      setDashboardData(resDash.data);
    } catch (error) {
      console.error('Erro ao carregar o financeiro:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter(t => {
      const termo = buscaTexto.toLowerCase();
      // O modelo salva na prop 'categoria', não tem mais 'sub'
      const descricaoEfetiva = t.descricao?.trim() || t.categoria || '';
      
      const matchTexto = 
        descricaoEfetiva.toLowerCase().includes(termo) || 
        (t.categoria || '').toLowerCase().includes(termo);
      
      const matchMes = buscaMes ? t.data.startsWith(buscaMes) : true;
      return matchTexto && matchMes;
    });
  }, [transacoes, buscaTexto, buscaMes]);

  return {
    transacoes,
    transacoesFiltradas,
    buscaTexto, setBuscaTexto,
    buscaMes, setBuscaMes,
    atualizarTransacoes: carregarDados,
    totalEntradas: dashboardData.total_entradas,
    totalSaidas: dashboardData.total_saidas,
    saldoAtual: dashboardData.saldo_atual,
    loading
  };
}
