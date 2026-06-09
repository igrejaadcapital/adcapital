import api from './config';

export type MembroPayload = Record<string, unknown>;

const membroService = {
  listar: () => api.get('/membros/lista/'),

  salvar: (id: number | null | undefined, dados: MembroPayload) => {
    if (id) {
      return api.put(`/membros/${id}/salvar/`, dados);
    }
    return api.post('/membros/cadastrar/', dados);
  },

  excluir: (id: number) => api.delete(`/membros/${id}/`),

  getFuncoes: () => api.get('/opcoes-funcao/'),
  excluirFuncao: (id: number) => api.delete(`/funcoes/${id}/`),
  getGraus: () => api.get('/opcoes-parentesco/'),

  baixarTermoLgpdEmBranco: () =>
    api.get('/membros/termo-lgpd-em-branco/', { responseType: 'blob' }),
};

export default membroService;
