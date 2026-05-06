// Version 1.1: Updated with CPF constraints and name casing
import api from './config';

const membroService = {
    // Busca a lista completa de membros do Django (/api/membros/lista/)
    listar: () => api.get('/membros/lista/'),

    // Envia um novo membro ou atualiza um existente usando endpoints descritivos
    salvar: (id, dados) => {
        if (id) {
            return api.put(`/membros/${id}/salvar/`, dados);
        }
        return api.post('/membros/cadastrar/', dados);
    },

    // Remove um membro pelo ID
    excluir: (id) => api.delete(`/membros/${id}/`),

    // Administração de Funções
    getFuncoes: () => api.get('/opcoes-funcao/'),
    excluirFuncao: (id) => api.delete(`/funcoes/${id}/`),
    getGraus: () => api.get('/opcoes-parentesco/')
};

export default membroService;