import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Instagram,
  Youtube,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';
import api from '../../api/config';
import { trackPageView, trackCustomEvent } from '../../shared/hooks/useAnalytics';
import { trackInternalAcesso } from '../../api/internalAnalytics';
import LandingPastoralSection from './landing/sections/LandingPastoralSection';
import LandingProgramacaoSection from './landing/sections/LandingProgramacaoSection';
import LandingFooterSection from './landing/sections/LandingFooterSection';

// O api-config já possui o baseURL (/api)
const LandingPage = () => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    trackPageView('/', 'AD Capital - Site Oficial');
    trackInternalAcesso('SITE');
  }, []);

  const [programacao, setProgramacao] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [ultimoVideo, setUltimoVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Curtidas da Palavra Pastoral
  const [curtidas, setCurtidas] = useState(0);
  const [jaCurtiu, setJaCurtiu] = useState(false);

  // Comentarios
  const [comentarios, setComentarios] = useState([]);
  const [novoNome, setNovoNome] = useState('');
  const [novoTexto, setNovoTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [, setDevocionais] = useState([]);

  const fetchComentarios = async () => {
    try {
      const res = await api.get('/comentarios/');
      setComentarios(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchComentarios();
  }, []);

  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoTexto.trim()) return;
    setEnviando(true);
    try {
      const res = await api.post('/comentarios/', {
        configuracao: 1, // ID do ConfiguracaoSite padrao
        nome: novoNome,
        texto: novoTexto
      });
      setComentarios([res.data, ...comentarios]);
      setNovoNome('');
      setNovoTexto('');
    } catch {
      alert("Erro ao enviar comentário.");
    } finally {
      setEnviando(false);
    }
  };

  useEffect(() => {
    // Verifica se já curtiu neste navegador
    const curtiuStatus = localStorage.getItem('@adcapital:curtiu_palavra');
    if (curtiuStatus === 'true') {
      setJaCurtiu(true);
    }
  }, []);

  useEffect(() => {
    if (config?.curtidas_palavra !== undefined) {
      setCurtidas(config.curtidas_palavra);
    }
  }, [config?.curtidas_palavra]);

  const handleCurtirPalavra = async () => {
    if (jaCurtiu) return;
    
    // Atualização otimista
    setCurtidas(prev => prev + 1);
    setJaCurtiu(true);
    localStorage.setItem('@adcapital:curtiu_palavra', 'true');

    try {
      await api.post('/curtir-palavra/');
    } catch (err) {
      console.error('Erro ao curtir a palavra:', err);
      // Reverte em caso de erro
      setCurtidas(prev => prev - 1);
      setJaCurtiu(false);
      localStorage.removeItem('@adcapital:curtiu_palavra');
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async (attempt = 1) => {
      const maxAttempts = 3;
      try {
        // ENDPOINT CONSOLIDADO: 1 request em vez de 3
        const res = await api.get('/init-site/');
        if (cancelled) return;

        setConfig(res.data.config || null);
        setProgramacao(res.data.programacao || []);
        setGaleria(res.data.galeria || []);
        
        // Busca devocionais
        api.get('/devocionais/').then(r => setDevocionais(r.data)).catch(() => {});

        // Busca o último vídeo separadamente (não bloqueia o carregamento)
        if (res.data.config?.youtube_channel_id) {
          api.get('/ultimo-video/').then(r => setUltimoVideo(r.data)).catch(() => { });
        }
      } catch (err) {
        console.error(`Erro ao carregar dados do site (tentativa ${attempt}):`, err);
        if (attempt < maxAttempts && !cancelled) {
          // Retry com backoff: o axios interceptor já faz 3 retries,
          // mas se falhou total, tentamos o endpoint inteiro de novo
          const waitTime = attempt * 5000;
          await new Promise(r => setTimeout(r, waitTime));
          if (!cancelled) return fetchData(attempt + 1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const isInstagramPostUrl = (url) => {
    if (!url) return false;
    return url.includes('instagram.com') && (url.includes('/p/') || url.includes('/reel/') || url.includes('/tv/'));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500 selection:text-white overflow-x-hidden font-sans">

      {/* --- STICKY NAVBAR --- */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 pb-2 safe-area-pt">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full" />
            <span className="font-black tracking-tighter text-lg uppercase italic">AD CAPITAL</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <button onClick={() => scrollTo('programacao')} className="hover:text-blue-400 transition-colors uppercase">Programação</button>
            <button onClick={() => scrollTo('galeria')} className="hover:text-blue-400 transition-colors uppercase">Galeria</button>
            <button onClick={() => scrollTo('transmissao')} className="hover:text-blue-400 transition-colors uppercase">Ao Vivo</button>
          </div>
          <a
            href="#/portal"
            onClick={() => trackCustomEvent('click_portal_membro', 'Navegacao', 'Botoes do Cabecalho')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
          >
            Portal do Membro
          </a>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[65vh] flex flex-col items-center justify-center pt-16 pb-12 px-6 text-center overflow-hidden">
        {/* Background Sophisticated Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-indigo-700/20 rounded-full blur-[140px]" />
          <div className="absolute top-[40%] left-[30%] w-[20%] h-[20%] bg-blue-400/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="z-10 flex flex-col items-center"
        >
          <div className="relative mb-4">
            <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
            <img src="/logo.png" alt="Logo AD Capital" className="relative w-28 h-28 drop-shadow-2xl rounded-full object-cover border-4 border-white/5" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              IGREJA <br className="md:hidden" />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent">
                AD CAPITAL
              </span>
            </h1>
            <p className="text-base md:text-xl text-slate-400 max-w-xl mx-auto font-medium tracking-tight leading-relaxed opacity-80 uppercase italic">
              "Lugar de Restauração, Vida e Paz."
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center gap-6 mt-12">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(config?.google_maps_url || '#', '_blank')}
              className="px-10 py-5 bg-white text-slate-950 font-black rounded-2xl transition-all shadow-2xl flex items-center gap-3 uppercase tracking-widest text-[11px]"
            >
              <MapPin size={18} className="text-blue-600" />
              Como Chegar
            </motion.button>

            <div className="flex gap-4">
              <a href={config?.instagram_url} target="_blank" className="w-14 h-14 flex items-center justify-center bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-white border border-white/10 group backdrop-blur-sm">
                <Instagram size={20} className="group-hover:text-pink-500 transition-colors" />
              </a>
              <a href={config?.youtube_url} target="_blank" className="w-14 h-14 flex items-center justify-center bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-white border border-white/10 group backdrop-blur-sm">
                <Youtube size={20} className="group-hover:text-red-500 transition-colors" />
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-10 opacity-30"
        >
          <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-slate-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* --- PALAVRA PASTORAL --- */}
      <LandingPastoralSection
        config={config}
        curtidas={curtidas}
        jaCurtiu={jaCurtiu}
        handleCurtirPalavra={handleCurtirPalavra}
        comentarios={comentarios}
        novoNome={novoNome}
        setNovoNome={setNovoNome}
        novoTexto={novoTexto}
        setNovoTexto={setNovoTexto}
        enviando={enviando}
        handleEnviarComentario={handleEnviarComentario}
      />

      {/* --- PROGRAMAÇÃO --- */}
      <LandingProgramacaoSection programacao={programacao} />

      {/* --- GALERIA DE FOTOS --- */}
      {galeria.length > 0 && (
        <section id="galeria" className="py-20 max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-16">
            <h2 className="text-3xl font-black tracking-tight text-center uppercase flex items-center gap-2">
              <ImageIcon className="text-blue-500" /> Nossa Galeria
            </h2>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {galeria.map((foto) => (
              <motion.div
                key={foto.id}
                whileHover={{ scale: 1.02 }}
                className="relative group overflow-hidden rounded-2xl cursor-pointer shadow-xl"
              >
                <img
                  src={foto.imagem}
                  alt={foto.legenda}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-white text-sm font-medium">{foto.legenda}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* --- VIDEO INSTITUCIONAL --- */}
      {config?.video_sobre_nos_url && (
        <section className="py-20 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-2 block">Institucional</span>
              <h2 className="text-3xl font-black uppercase">Um pouco sobre nós</h2>
            </div>
            <div className="aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-800">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${(config.video_sobre_nos_url.split('v=')[1] || config.video_sobre_nos_url.split('/').pop()).split('&')[0]}`}
                title="Um pouco sobre nós"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* --- NOSSA TRANSMISSÃO / LIVE --- */}
      {ultimoVideo && (
        <section id="transmissao" className="py-24 bg-slate-900/80 relative overflow-hidden">
          {/* Decorative background for the live section */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-red-600 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-red-500 font-black uppercase tracking-widest text-[10px]">Transmissão ao Vivo</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 italic">Assista <span className="text-red-500 font-black">AD Capital</span></h2>
              <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
                Acompanhe nossos cultos e eventos em tempo real diretamente de Brasília para o mundo.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative group"
            >
              {/* Decorative Frame */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-indigo-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

              <div className="relative aspect-video rounded-[2.2rem] overflow-hidden shadow-2xl border-2 border-slate-800 bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`${ultimoVideo.embed_url || ultimoVideo.live_embed_url}?rel=0&modestbranding=1&autoplay=0`}
                  title="AD Capital Ao Vivo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
              <div className="text-center md:text-left flex-1 max-w-xl">
                <h3 className="text-white font-bold text-xl mb-2 line-clamp-1">{ultimoVideo.title}</h3>
                <p className="text-slate-500 text-sm italic">
                  Canal Oficial: <span className="text-slate-300 font-bold">@adcapital.church</span>
                </p>
              </div>
              <div className="flex gap-4">
                <a
                  href={ultimoVideo.watch_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-full transition-all text-sm uppercase tracking-widest shadow-xl shadow-red-900/30"
                >
                  <Youtube size={20} /> Youtube
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- ÚLTIMO POST INSTAGRAM --- */}
      {config?.ultimo_post_instagram_url && isInstagramPostUrl(config.ultimo_post_instagram_url) && (
        <section className="py-20">
          <div className="max-w-lg mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-pink-500 font-bold uppercase tracking-widest text-xs mb-2 block flex items-center justify-center gap-2">
                <Instagram size={14} className="inline" /> Instagram
              </span>
              <h2 className="text-3xl font-black uppercase">Último Post</h2>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-[2rem] overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-900"
            >
              <iframe
                src={`${config.ultimo_post_instagram_url.replace(/\/$/, '')}/embed/captioned/`}
                width="100%"
                height="580"
                frameBorder="0"
                scrolling="no"
                allowTransparency="true"
                className="w-full"
              />
            </motion.div>
            <div className="text-center mt-6">
              <a
                href={config.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-full transition-all text-sm shadow-lg"
              >
                <Instagram size={18} /> Ver no Instagram
              </a>
            </div>
          </div>
        </section>
      )}

      {/* --- FOOTER / CONTATO --- */}
      <LandingFooterSection config={config} />

    </div>
  );
};

export default LandingPage;
