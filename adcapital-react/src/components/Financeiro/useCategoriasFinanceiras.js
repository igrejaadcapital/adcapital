import { useState } from 'react';

const CATEGORIAS_PADRAO_ENTRADAS = ["Dízimos", "Ofertas", "Filantropia", "Rendimentos", "Outros"];
const CATEGORIAS_PADRAO_SAIDAS = ["Água", "Luz", "Telefone", "Aluguel", "Condomínio", "Manutenção", "Obras", "Filantropia", "Outros"];

export function useCategoriasFinanceiras() {
  const [categorias, setCategorias] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        entradas: CATEGORIAS_PADRAO_ENTRADAS,
        saidas: CATEGORIAS_PADRAO_SAIDAS,
      };
    }

    const salvas = localStorage.getItem('categoriasFinanceiras');
    if (salvas) {
      try {
        const parsed = JSON.parse(salvas);
        return {
          entradas: parsed.entradas || CATEGORIAS_PADRAO_ENTRADAS,
          saidas: parsed.saidas || CATEGORIAS_PADRAO_SAIDAS,
        };
      } catch {
        return {
          entradas: CATEGORIAS_PADRAO_ENTRADAS,
          saidas: CATEGORIAS_PADRAO_SAIDAS,
        };
      }
    }

    return {
      entradas: CATEGORIAS_PADRAO_ENTRADAS,
      saidas: CATEGORIAS_PADRAO_SAIDAS,
    };
  });

  const persistir = (novasCategorias) => {
    setCategorias(novasCategorias);
    if (typeof window !== 'undefined') {
      localStorage.setItem('categoriasFinanceiras', JSON.stringify(novasCategorias));
    }
  };

  const adicionarCategoriaEntrada = (nova) => {
    if (!nova) return;
    if (categorias.entradas.includes(nova)) return;
    persistir({
      ...categorias,
      entradas: [...categorias.entradas, nova],
    });
  };

  const adicionarCategoriaSaida = (nova) => {
    if (!nova) return;
    if (categorias.saidas.includes(nova)) return;
    persistir({
      ...categorias,
      saidas: [...categorias.saidas, nova],
    });
  };

  return {
    categoriasEntrada: categorias.entradas,
    categoriasSaida: categorias.saidas,
    adicionarCategoriaEntrada,
    adicionarCategoriaSaida,
  };
}

