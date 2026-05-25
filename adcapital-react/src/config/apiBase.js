/** URL base da API — em build mobile sempre produção (ver npm run build:mobile). */
const PRODUCTION_API = 'https://api.adcapitaligreja.com.br/api/v1';

export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return PRODUCTION_API;
}
