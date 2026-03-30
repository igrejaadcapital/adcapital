import api from './config';

const configuracaoService = {
  // Cargos (Roles) - Mantendo compatibilidade com o que já existia em membroService
  listarFuncoes: () => api.get('/opcoes-funcao/'),
  excluirFuncao: (id) => api.delete(`/funcoes/${id}/`),
  salvarFuncao: (dados) => api.post('/funcoes/', dados),

  // Categorias Financeiras
  listarCategorias: () => api.get('/financeiro/categorias/'),
  salvarCategoria: (dados) => {
    if (dados.id) {
      return api.put(`/financeiro/categorias/${dados.id}/`, dados);
    }
    return api.post('/financeiro/categorias/', dados);
  },
  excluirCategoria: (id) => api.delete(`/financeiro/categorias/${id}/`),
};

export default configuracaoService;
