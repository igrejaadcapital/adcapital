// src/components/Financeiro/useFinanceiro.js
import { useState, useMemo } from 'react';

export function useFinanceiro() {
  
  const [transacoes, setTransacoes] = useState(() => {
    
    const salvas = localStorage.getItem('transacoes');
    return salvas ? JSON.parse(salvas) : [
      { id: 1, data: '2026-03-12', descricao: 'Dízimos e Ofertas', sub: 'Dízimos', valor: 850, tipo: 'ENTRADA' },
      { id: 2, data: '2026-03-10', descricao: 'Pagamento Energia', sub: 'Luz', valor: 340, tipo: 'SAIDA' },
    ];
  });

  // Estados dos Filtros
  const [buscaTexto, setBuscaTexto] = useState(''); // Para Descrição e Categoria
  const [buscaMes, setBuscaMes] = useState('');     // Formato "YYYY-MM"

  // Processa a lista filtrada
  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter(t => {

      const termo = buscaTexto.toLowerCase();

      // Se a descrição estiver vazia, usamos a subcategoria para a comparação
      const descricaoEfetiva = t.descricao?.trim() || t.sub;
      
      // Lógica de Texto (Busca na descrição ou na sub-categoria)
      const matchTexto = 
        descricaoEfetiva.toLowerCase().includes(termo) || 
        t.sub.toLowerCase().includes(termo);
      
      // Lógica de Mês
      const matchMes = buscaMes ? t.data.startsWith(buscaMes) : true;
      
      return matchTexto && matchMes;
    });
  },[transacoes, buscaTexto, buscaMes]);

  const atualizarTransacoes = (novasTransacoes) => {
    setTransacoes(novasTransacoes);
    localStorage.setItem('transacoes', JSON.stringify(novasTransacoes));
  };

  const { totalEntradas, totalSaidas, saldoAtual } = useMemo(() => {
    const totalEntradas = transacoesFiltradas
      .filter((t) => t.tipo === 'ENTRADA')
      .reduce((acc, t) => acc + t.valor, 0);

    const totalSaidas = transacoesFiltradas
      .filter((t) => t.tipo === 'SAIDA')
      .reduce((acc, t) => acc + t.valor, 0);

    const saldoBase = 15250.0;
    const saldoAtual = saldoBase + totalEntradas - totalSaidas;

    return { totalEntradas: totalEntradas, totalSaidas: totalSaidas, saldoAtual: saldoAtual };
  }, [transacoesFiltradas]);

  return {
    transacoes,
    transacoesFiltradas,
    buscaTexto, setBuscaTexto,
    buscaMes, setBuscaMes,
    atualizarTransacoes,
    totalEntradas,
    totalSaidas,
    saldoAtual,
  };
}
