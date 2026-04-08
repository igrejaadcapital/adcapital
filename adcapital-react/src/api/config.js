// src/api/config.js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://api.adcapitaligreja.com.br/api',
    timeout: 30000 // Aumentado para 30s para suportar "Cold Starts" do Render
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor de resposta para o refresh do token e tratamento de erros de conexão
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Se for erro de timeout ou rede (sem resposta do servidor)
        if (error.code === 'ECONNABORTED' || !error.response) {
            console.error("Erro de conexão ou tempo de resposta esgotado.");
            // REMOVIDO: window.location.href = '/';  <-- Causava loop infinito
            return Promise.reject(error);
        }

        // Se o erro for 401 e não for uma tentativa de refresh (gerando loop)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    // Tenta renovar o token
                    const response = await axios.post(`${api.defaults.baseURL}/token/refresh/`, {
                        refresh: refreshToken
                    });

                    if (response.status === 200) {
                        const { access } = response.data;
                        localStorage.setItem('access_token', access);
                        
                        // Atualiza o header do request original e tenta de novo
                        originalRequest.headers.Authorization = `Bearer ${access}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    // Se o refresh falhar (token expirado ou inválido), desloga
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/';
                }
            } else {
                // Se não tem refresh token, vai para o login
                localStorage.removeItem('access_token');
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default api;