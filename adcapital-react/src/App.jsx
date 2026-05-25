import { useEffect, useState } from 'react';
import AutoCadastroPage from './components/Membros/AutoCadastroPage';
import { getApiBaseUrl } from './config/apiBase';
import { initializeGA } from './hooks/useAnalytics';
import AppRoutes from './routes/AppRoutes';
import HashLegacyRedirect from './routes/HashLegacyRedirect';

function isCadastroHost() {
  return window.location.hostname.toLowerCase().startsWith('cadastro.');
}

function App() {
  const [isWakingUp, setIsWakingUp] = useState(false);

  useEffect(() => {
    initializeGA();
    console.log('Versão do App: Router-v1.7');
    console.log('URL Atual:', window.location.href);
  }, []);

  useEffect(() => {
    const warmup = async (attempt = 1) => {
      const maxAttempts = 4;
      const delays = [5000, 15000, 30000, 60000];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const baseUrl = getApiBaseUrl();
        console.log(`[Warm-up] Tentativa ${attempt}/${maxAttempts}...`);

        if (attempt > 1) setIsWakingUp(true);

        await fetch(`${baseUrl}/ping/`, { signal: controller.signal });

        console.log('[Warm-up] Servidor respondeu com sucesso.');
        setIsWakingUp(false);
      } catch {
        if (attempt < maxAttempts) {
          const wait = delays[attempt - 1];
          console.warn(`[Warm-up] Falha (tentativa ${attempt}). Retentando em ${wait / 1000}s...`);
          setIsWakingUp(true);
          clearTimeout(timeoutId);
          await new Promise((r) => setTimeout(r, wait));
          return warmup(attempt + 1);
        }
        console.warn('[Warm-up] Servidor não respondeu após todas as tentativas.');
        setIsWakingUp(false);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    warmup();
    const interval = setInterval(() => warmup(), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isCadastroHost()) {
    return <AutoCadastroPage />;
  }

  return (
    <HashLegacyRedirect>
      <AppRoutes isWakingUp={isWakingUp} />
    </HashLegacyRedirect>
  );
}

export default App;
