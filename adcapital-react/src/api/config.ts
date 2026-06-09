import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getApiBaseUrl } from '../config/apiBase';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 90000,
  withCredentials: true,
});

api.interceptors.request.use((config) => config, (error) => Promise.reject(error));

let isRefreshing = false;
const failedQueue: Array<{
  resolve: (token?: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token ?? undefined);
  });
  failedQueue.length = 0;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error: {
  response?: { status?: number };
  code?: string;
  message?: string;
}) => {
  const status = error.response?.status;
  return (
    status === 502
    || status === 503
    || status === 504
    || error.code === 'ECONNABORTED'
    || error.code === 'ERR_NETWORK'
    || (!error.response && error.message?.includes('Network Error'))
  );
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retryCount?: number;
      _retry?: boolean;
    };

    if (isRetryableError(error) && (!originalRequest._retryCount || originalRequest._retryCount < 3)) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      const delays = [3000, 8000, 15000];
      await delay(delays[originalRequest._retryCount - 1]);
      return api(originalRequest);
    }

    if (error.code === 'ECONNABORTED' || !error.response) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${api.defaults.baseURL}/token/refresh/`,
          {},
          { withCredentials: true },
        );
        if (response.status === 200) {
          processQueue(null, response.data.access);
          isRefreshing = false;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
      }

      const path = window.location.pathname;
      const hashPath = (window.location.hash || '').replace(/^#/, '');
      const isPublicPortal = path.startsWith('/cadastro') || hashPath.startsWith('/cadastro');
      const isLoginPage =
        path === '/' || path === '/login' || hashPath === '/login' || hashPath === '/';

      if (!isPublicPortal && !isLoginPage) {
        window.location.href = import.meta.env.DEV ? '/login' : '/#/login';
      }
    }

    return Promise.reject(error);
  },
);

export default api;
