import { QueryClient } from '@tanstack/react-query';

/**
 * Retry para cold start da API no Render Free.
 * Erros 401/403 não devem repetir (auth/permissão).
 */
function shouldRetry(failureCount, error) {
  const status = error?.response?.status;
  if (status === 401 || status === 403 || status === 404) {
    return false;
  }
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const agendaKeys = {
  eventos: ['agenda', 'eventos'],
  status: ['agenda', 'status'],
};
