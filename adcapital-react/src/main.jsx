import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './features/auth/AuthProvider'
import { queryClient } from './api/queryClient'
import { initCapacitor, isNativeApp } from './mobile/capacitorSetup'

// Em produção no Render (static site), URLs reais (/admin/...) dão 404 sem rewrite.
// HashRouter usa /#/admin/... — o servidor só precisa servir index.html em /.
const Router = import.meta.env.DEV ? BrowserRouter : HashRouter

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  </StrictMode>,
)

initCapacitor();

// PWA: service worker só no navegador (não no app Capacitor)
if ('serviceWorker' in navigator && !isNativeApp()) {
  window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('SW registered:', reg);
    }).catch((err) => {
      console.log('SW registration failed:', err);
    });
  });
}
