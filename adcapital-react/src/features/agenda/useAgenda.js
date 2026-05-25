import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/config';
import { agendaKeys } from '../../api/queryClient';

async function fetchEventos() {
  const response = await api.get('/agenda/eventos/');
  return response.data;
}

async function fetchSyncStatus() {
  const response = await api.get('/agenda/status/');
  return response.data;
}

export function useAgenda({ includeSyncStatus = true } = {}) {
  const queryClient = useQueryClient();

  const eventosQuery = useQuery({
    queryKey: agendaKeys.eventos,
    queryFn: fetchEventos,
  });

  const statusQuery = useQuery({
    queryKey: agendaKeys.status,
    queryFn: fetchSyncStatus,
    enabled: includeSyncStatus,
    retry: 1,
  });

  const invalidateEventos = () =>
    queryClient.invalidateQueries({ queryKey: agendaKeys.eventos });

  const criarEventoMutation = useMutation({
    mutationFn: (novoEvento) =>
      api.post('/agenda/eventos/', {
        titulo: novoEvento.titulo,
        descricao: novoEvento.descricao,
        data_inicio: new Date(novoEvento.data_inicio).toISOString(),
        data_fim: new Date(novoEvento.data_fim).toISOString(),
      }),
    onSuccess: invalidateEventos,
  });

  const deletarEventoMutation = useMutation({
    mutationFn: (id) => api.delete(`/agenda/eventos/${id}/`),
    onSuccess: invalidateEventos,
  });

  const editarEventoMutation = useMutation({
    mutationFn: ({ id, dados }) => api.put(`/agenda/eventos/${id}/`, dados),
    onSuccess: invalidateEventos,
  });

  const syncMutation = useMutation({
    mutationFn: () => api.post('/agenda/sync/'),
    onSuccess: invalidateEventos,
  });

  const criarEvento = async (novoEvento) => {
    try {
      await criarEventoMutation.mutateAsync(novoEvento);
      return true;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      return false;
    }
  };

  const deletarEvento = async (id) => {
    try {
      await deletarEventoMutation.mutateAsync(id);
      return true;
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      return false;
    }
  };

  const editarEvento = async (id, dados) => {
    try {
      await editarEventoMutation.mutateAsync({ id, dados });
      return true;
    } catch (error) {
      console.error('Erro ao editar evento:', error);
      return false;
    }
  };

  const sincronizarComGoogle = async () => {
    try {
      const response = await syncMutation.mutateAsync();
      return response.data;
    } catch (error) {
      console.error('Erro ao sincronizar com Google:', error);
      return { error: 'Falha na sincronização externa' };
    }
  };

  const carregando =
    eventosQuery.isPending ||
    eventosQuery.isFetching ||
    criarEventoMutation.isPending ||
    deletarEventoMutation.isPending ||
    editarEventoMutation.isPending ||
    syncMutation.isPending;

  return {
    eventos: eventosQuery.data ?? [],
    carregando,
    error: eventosQuery.isError,
    syncStatus: statusQuery.data ?? { status: 'loading', message: '' },
    buscarEventos: () => eventosQuery.refetch(),
    verificarStatus: () => statusQuery.refetch(),
    criarEvento,
    deletarEvento,
    editarEvento,
    sincronizarComGoogle,
  };
}
