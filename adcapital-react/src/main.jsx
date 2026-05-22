import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './components/Auth/AuthProvider'
import { queryClient } from './api/queryClient'
import { initCapacitor, isNativeApp } from './mobile/capacitorSetup'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)

initCapacitor();

// PWA: service worker só no navegador (não no app Capacitor)
if ('serviceWorker' in navigator && !isNativeApp()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      console.log('SW registered:', reg);
    }).catch((err) => {
      console.log('SW registration failed:', err);
    });
  });
}
