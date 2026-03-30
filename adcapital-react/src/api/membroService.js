// Version 1.1: Updated with CPF constraints and name casing
import api from './config';

const membroService = {
    // Busca a lista completa de membros do Django (/api/membros/)
    listar: () => api.get('/membros/'),

    // Envia um novo membro (POST) ou atualiza um existente (PUT)
    salvar: (id, dados) => {
        if (id) {
            return api.put(`/membros/${id}/`, dados);
        }
        return api.post('/membros/', dados);
    },

    // Remove um membro pelo ID (/api/membros/1/)
    excluir: (id) => api.delete(`/membros/${id}/`),

    // Administração de Funções
    getFuncoes: () => api.get('/opcoes-funcao/'),
    excluirFuncao: (id) => api.delete(`/funcoes/${id}/`),
    getGraus: () => api.get('/opcoes-parentesco/')
};

export default membroService;