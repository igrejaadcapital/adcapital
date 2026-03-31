import { useState, useCallback, useEffect } from 'react';
import api from '../../api/config';

export function useAgenda() {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const buscarEventos = useCallback(async () => {
    setCarregando(true);
    try {
      const response = await api.get('/agenda/eventos/');
      setEventos(response.data);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarEventos();
  }, [buscarEventos]);

  const criarEvento = async (novoEvento) => {
    setCarregando(true);
    try {
      await api.post('/agenda/eventos/', {
          titulo: novoEvento.titulo,
          descricao: novoEvento.descricao,
          data_inicio: new Date(novoEvento.data_inicio).toISOString(),
          data_fim: new Date(novoEvento.data_fim).toISOString()
      });
      await buscarEventos();
      return true;
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      return false;
    } finally {
      setCarregando(false);
    }
  };

  const deletarEvento = async (id) => {
    setCarregando(true);
    try {
      await api.delete(`/agenda/eventos/${id}/`);
      await buscarEventos();
      return true;
    } catch (error) {
      console.error("Erro ao deletar evento:", error);
      return false;
    } finally {
      setCarregando(false);
    }
  };

  const sincronizar = async (id, dados) => {
    setCarregando(true);
    try {
      await api.put(`/agenda/eventos/${id}/`, dados);
      await buscarEventos();
      return true;
    } catch (error) {
      console.error("Erro ao sincronizar evento:", error);
      return false;
    } finally {
      setCarregando(false);
    }
  };

  return { eventos, carregando, buscarEventos, criarEvento, deletarEvento, sincronizar };
}
