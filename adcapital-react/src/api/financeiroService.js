import api from './config';

const financeiroService = {
    getDashboard: () => api.get('/financeiro/dashboard/'),
    listar: () => api.get('/financeiro/transacoes/'),
    
    salvar: (id, dados) => {
        const formData = new FormData();
        for (const key in dados) {
            if (dados[key] !== null && dados[key] !== undefined) {
                // If it's a file, append the File object itself
                formData.append(key, dados[key]);
            }
        }
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        if (id) {
            return api.put(`/financeiro/transacoes/${id}/`, formData, config);
        }
        return api.post('/financeiro/transacoes/', formData, config);
    },

    excluir: (id) => api.delete(`/financeiro/transacoes/${id}/`),
};

export default financeiroService;