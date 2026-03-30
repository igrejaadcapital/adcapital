import { useState, useEffect } from 'react';
import configuracaoService from '../../api/configuracaoService';

export function useCategoriasFinanceiras() {
  const [categoriasEntrada, setCategoriasEntrada] = useState([]);
  const [categoriasSaida, setCategoriasSaida] = useState([]);

  const carregarCategorias = async () => {
    try {
      const res = await configuracaoService.listarCategorias();
      setCategoriasEntrada(res.data.filter(c => c.tipo === 'ENTRADA').map(c => c.nome));
      setCategoriasSaida(res.data.filter(c => c.tipo === 'SAIDA').map(c => c.nome));
    } catch (err) {
      console.error("Erro ao carregar categorias do banco:", err);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  const adicionarCategoriaEntrada = async (nova) => {
    if (!nova) return;
    try {
      await configuracaoService.salvarCategoria({ nome: nova, tipo: 'ENTRADA' });
      carregarCategorias();
    } catch (err) {
      console.error("Erro ao salvar categoria:", err);
    }
  };

  const adicionarCategoriaSaida = async (nova) => {
    if (!nova) return;
    try {
      await configuracaoService.salvarCategoria({ nome: nova, tipo: 'SAIDA' });
      carregarCategorias();
    } catch (err) {
      console.error("Erro ao salvar categoria:", err);
    }
  };

  return {
    categoriasEntrada,
    categoriasSaida,
    adicionarCategoriaEntrada,
    adicionarCategoriaSaida,
  };
}

