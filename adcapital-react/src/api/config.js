// src/api/config.js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://api.adcapitaligreja.com.br/api',
    timeout: 90000 // Aumentado para 90s para suportar "Cold Starts" do Render e envio de e-mails LGPD com anexo
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
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// Função auxiliar de delay para retry
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // --- RETRY AUTOMÁTICO PARA 502/503 (Cold Start do Render) ---
        const status = error.response?.status;
        if ((status === 502 || status === 503) && (!originalRequest._retryCount || originalRequest._retryCount < 3)) {
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
            const waitTime = originalRequest._retryCount * 2000; // 2s, 4s, 6s
            console.warn(`[Retry ${originalRequest._retryCount}/3] Servidor retornou ${status}. Tentando novamente em ${waitTime/1000}s...`);
            await delay(waitTime);
            return api(originalRequest);
        }

        // Se for erro de timeout ou rede (sem resposta do servidor)
        if (error.code === 'ECONNABORTED' || !error.response) {
            console.error("Erro de conexão ou tempo de resposta esgotado.");
            return Promise.reject(error);
        }

        // Se o erro for 401 (Não autorizado)
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Se já estivermos tentando renovar o token, enfileira este request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post(`${api.defaults.baseURL}/token/refresh/`, {
                        refresh: refreshToken
                    });

                    if (response.status === 200) {
                        const { access } = response.data;
                        localStorage.setItem('access_token', access);
                        originalRequest.headers.Authorization = `Bearer ${access}`;
                        
                        processQueue(null, access);
                        isRefreshing = false;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    isRefreshing = false;
                    console.error("Falha Crítica no Refresh Token:", refreshError);
                }
            } else {
                isRefreshing = false;
            }

            // Se chegou aqui, falha total na autenticação
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');

            // Redireciona para o login apenas se necessário e se NÃO estivermos já nele
            const isPublicPortal = window.location.hash.includes('cadastro');
            const isLoginPage = window.location.pathname === '/' || window.location.hash === '#/';
            
            if (!isPublicPortal && !isLoginPage) {
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default api;