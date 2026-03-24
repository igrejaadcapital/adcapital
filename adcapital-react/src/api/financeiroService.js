// src/api/financeiroService.js
import api from './config';

export const financeiroService = {
    // Procura todos os lançamentos (Entradas e Saídas)
    listar: () => api.get('/financeiro/lancamentos/'),

    // Guarda um novo lançamento ou atualiza um existente
    // Se tiver ID, usa PUT (editar), se não tiver, usa POST (novo)
    salvar: (dados) => {
        if (dados.id && typeof dados.id === 'number' && dados.id < 1000000000) {
            return api.put(`/financeiro/lancamentos/${dados.id}/`, dados);
        }
        // Nota: Se o ID for um timestamp gigante do JS, o Django deve tratar como novo
        return api.post('/financeiro/lancamentos/', dados);
    },

    // Elimina um registo
    excluir: (id) => api.delete(`/financeiro/lancamentos/${id}/`),

    // Procura as categorias (Dízimos, Ofertas, Aluguer, etc.) que vêm do banco de dados
    listarCategorias: (tipo) => api.get(`/financeiro/categorias/?tipo=${tipo}`)
};