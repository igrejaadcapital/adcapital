// src/hooks/useAnalytics.js

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-7KZ3C5J6TH';

/**
 * Inicializa dinamicamente o Google Analytics 4 (GA4).
 * Adiciona a tag gtag.js ao head do documento de forma programática.
 */
export function initializeGA() {
  if (window.gtag) return;
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    console.log('[Analytics] GA não inicializado: ID não configurado ou usando placeholder de exemplo.');
    return;
  }

  try {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());

    // Configura o GA desabilitando o rastreamento automático de visualizações de página.
    // Isso é crucial para que a nossa SPA React controle e registre cada visualização manualmente.
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
    console.log(`[Analytics] Google Analytics 4 inicializado com sucesso. ID: ${GA_MEASUREMENT_ID}`);
  } catch (error) {
    console.error('[Analytics] Erro ao carregar script do Google Analytics:', error);
  }
}

/**
 * Envia uma visualização de página manual para o GA4.
 * @param {string} path - Ex: '/portal/mensagens' ou '/'
 * @param {string} title - Título descritivo da página ou aba
 */
export function trackPageView(path, title) {
  if (!window.gtag) {
    console.log(`[Analytics - Modo Simulado] Visualização de Página: ${path} - "${title}"`);
    return;
  }

  try {
    window.gtag('event', 'page_view', {
      page_title: title,
      page_location: window.location.origin + path,
      page_path: path
    });
    console.log(`[Analytics] Visualização de Página registrada: ${path} - "${title}"`);
  } catch (error) {
    console.error('[Analytics] Erro ao enviar page_view:', error);
  }
}

/**
 * Envia um evento customizado de interação para o GA4 (Ex: clique de conversão).
 * @param {string} action - Nome da ação (ex: 'click_portal_membro')
 * @param {string} category - Categoria do evento (ex: 'Navegação')
 * @param {string} label - Rótulo detalhado (ex: 'Botão Landing Page')
 * @param {number} value - Valor opcional associado
 */
export function trackCustomEvent(action, category, label = '', value = 0) {
  if (!window.gtag) {
    console.log(`[Analytics - Modo Simulado] Evento: "${action}" | Categoria: "${category}" | Rótulo: "${label}"`);
    return;
  }

  try {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
    console.log(`[Analytics] Evento registrado: "${action}"`);
  } catch (error) {
    console.error('[Analytics] Erro ao enviar evento customizado:', error);
  }
}
