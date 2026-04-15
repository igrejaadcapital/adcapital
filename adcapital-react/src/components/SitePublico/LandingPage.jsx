import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Instagram, 
  Youtube, 
  MapPin, 
  ChevronRight, 
  Heart, 
  Calendar, 
  Image as ImageIcon,
  MessageSquare,
  Facebook,
  ChevronDown
} from 'lucide-react';
import qrcode from '../../assets/qrcode.png';
import api from '../../api/config';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// O api-config já possui o baseURL (/api)
const LandingPage = () => {
  const [config, setConfig] = useState(null);
  const [programacao, setProgramacao] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [ultimoVideo, setUltimoVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resConfig, resProg, resGal] = await Promise.all([
          api.get('/configuracao-site/'),
          api.get('/agenda/programacao-semanal/'),
          api.get('/galeria/')
        ]);
        setConfig(resConfig.data);
        setProgramacao(resProg.data);
        setGaleria(resGal.data);

        // Busca o último vídeo separadamente (não bloqueia o carregamento)
        if (resConfig.data?.youtube_channel_id) {
          api.get('/ultimo-video/').then(r => setUltimoVideo(r.data)).catch(() => {});
        }
      } catch (err) {
        console.error("Erro ao carregar dados do site:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const diasSemana = [
    { id: 0, label: 'Domingo' },
    { id: 1, label: 'Segunda-feira' },
    { id: 2, label: 'Terça-feira' },
    { id: 3, label: 'Quarta-feira' },
    { id: 4, label: 'Quinta-feira' },
    { id: 5, label: 'Sexta-feira' },
    { id: 6, label: 'Sábado' },
  ];

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

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500 selection:text-white overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-700 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 flex flex-col items-center"
        >
          <img src="/logo.png" alt="Logo AD Capital" className="w-24 h-24 mb-6 drop-shadow-2xl rounded-full object-cover" />
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
            IGREJA <span className="text-blue-400">AD CAPITAL</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 max-w-2xl font-light italic">
            "Lugar de Restauração, Vida e Paz."
          </p>

          <div className="flex gap-4 mt-8">
             <a href={config?.instagram_url} target="_blank" className="p-4 bg-white/10 rounded-full hover:bg-blue-600 transition-all text-white backdrop-blur-md border border-white/10 shadow-xl group">
               <Instagram size={24} className="group-hover:scale-110 transition-transform" />
             </a>
             <a href={config?.youtube_url} target="_blank" className="p-4 bg-white/10 rounded-full hover:bg-red-600 transition-all text-white backdrop-blur-md border border-white/10 shadow-xl group">
               <Youtube size={24} className="group-hover:scale-110 transition-transform" />
             </a>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open(config?.google_maps_url || '#', '_blank')}
            className="mt-8 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-full transition-all shadow-2xl shadow-blue-900/40 flex items-center gap-3 uppercase tracking-widest text-sm"
          >
            <MapPin size={22} />
            COMO CHEGAR
          </motion.button>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10"
        >
          <ChevronDown className="text-slate-500" />
        </motion.div>
      </section>

      {/* --- PALAVRA PASTORAL --- */}
      {config?.pastoral_texto && (
        <section className="py-20 px-6 max-w-5xl mx-auto">
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 backdrop-blur-sm shadow-2xl">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shrink-0 border-4 border-blue-600/20 shadow-xl">
              <img 
                src={config.pastor_foto || 'https://via.placeholder.com/300?text=Pastor'} 
                alt={config.pastor_nome} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="text-blue-500 font-bold tracking-widest text-sm uppercase mb-3 block">Palavra Pastoral</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white leading-tight">
                {config.pastoral_titulo}
              </h2>
              <div className="text-slate-300 leading-relaxed text-lg space-y-4 whitespace-pre-wrap italic">
                {config.pastoral_texto}
              </div>
              <p className="mt-6 font-bold text-white text-xl">— {config.pastor_nome}</p>
            </div>
          </div>
        </section>
      )}

      {/* --- PROGRAMAÇÃO --- */}
      <section className="py-20 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-16">
            <div className="h-px w-12 bg-blue-500/30" />
            <h2 className="text-3xl font-black tracking-tight text-center uppercase flex items-center gap-2">
              <Calendar className="text-blue-500" /> Programação
            </h2>
            <div className="h-px w-12 bg-blue-500/30" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diasSemana.map((dia) => {
              const eventosDoDia = programacao.filter(p => p.dia_semana === dia.id);
              if (eventosDoDia.length === 0) return null;

              return (
                <motion.div 
                  key={dia.id}
                  whileHover={{ y: -5 }}
                  className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl group transition-all hover:border-blue-500/50"
                >
                  <h3 className="text-blue-400 font-black text-xl mb-6 flex items-center justify-between">
                    {dia.label}
                  </h3>
                  <div className="space-y-6">
                    {eventosDoDia.map(evento => (
                      <div key={evento.id} className="relative pl-6 border-l-2 border-slate-800 group-hover:border-blue-500/30 transition-colors">
                        <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-blue-500" />
                        <h4 className="font-bold text-white text-lg leading-snug mb-1">{evento.titulo}</h4>
                        <p className="text-slate-500 text-sm font-medium">{evento.horario}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- GALERIA DE FOTOS --- */}
      {galeria.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-6">
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
                src={`https://www.youtube.com/embed/${config.video_sobre_nos_url.split('v=')[1] || config.video_sobre_nos_url.split('/').pop()}`} 
                title="Um pouco sobre nós" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* --- ÚLTIMO VÍDEO YOUTUBE --- */}
      {ultimoVideo && (
        <section className="py-20 bg-slate-900/50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-red-500 font-bold uppercase tracking-widest text-xs mb-2 block flex items-center justify-center gap-2">
                <Youtube size={14} className="inline" /> YouTube
              </span>
              <h2 className="text-3xl font-black uppercase">Último Vídeo</h2>
              <p className="text-slate-400 text-sm mt-2 font-medium line-clamp-2 max-w-xl mx-auto">{ultimoVideo.title}</p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-2 border-slate-800"
            >
              <iframe
                width="100%"
                height="100%"
                src={`${ultimoVideo.embed_url}?rel=0&modestbranding=1`}
                title={ultimoVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
            <div className="text-center mt-6">
              <a
                href={ultimoVideo.watch_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full transition-all text-sm shadow-lg shadow-red-900/30"
              >
                <Youtube size={18} /> Ver no YouTube
              </a>
            </div>
          </div>
        </section>
      )}

      {/* --- ÚLTIMO POST INSTAGRAM --- */}
      {config?.ultimo_post_instagram_url && (
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
      <footer className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          
          {/* Coluna 1: QR Code e Endereço */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
             <div className="bg-white p-3 rounded-[2rem] shadow-2xl overflow-hidden w-[200px] h-[200px] border-4 border-slate-900">
                <img 
                  src={qrcode} 
                  alt="QR Code" 
                  className="w-full h-full object-contain"
                />
             </div>
             <div>
                <p className="text-white font-black text-2xl mb-1 uppercase tracking-tighter italic leading-none">AD CAPITAL</p>
                <p className="text-slate-500 max-w-[280px] text-xs font-bold leading-relaxed opacity-80">
                  {config?.endereco_completo}
                </p>
             </div>
          </div>

          {/* Coluna 2: Ofertas e Dízimos (Centro) */}
          <div className="flex flex-col items-center py-4 lg:py-0 w-full">
             <div className="bg-gradient-to-br from-blue-600 to-indigo-800 px-3 md:px-4 py-10 rounded-[3.5rem] shadow-2xl border border-white/20 w-full max-w-[500px] relative overflow-hidden group transition-all hover:scale-[1.02]">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <Heart className="w-12 h-12 mx-auto mb-6 text-white animate-pulse" />
                <h3 className="text-white font-black text-xl uppercase tracking-[0.3em] mb-10 text-center italic">Ofertas e Dízimos</h3>
                
                <div className="space-y-6">
                   <div className="bg-white/10 backdrop-blur-md py-6 px-1 md:px-2 rounded-3xl border border-white/30 text-center shadow-inner w-full overflow-hidden">
                      <span className="text-[10px] font-black text-blue-200 uppercase block mb-4 tracking-[0.4em]">CHAVE PIX</span>
                      <p className="text-base md:text-lg font-black text-white select-all tracking-tighter whitespace-nowrap leading-none">
                        {config?.pix_chave}
                      </p>
                   </div>
                   <p className="text-sm text-blue-100 font-black uppercase text-center tracking-[0.3em] opacity-90">
                      {config?.banco_nome}
                   </p>
                </div>
             </div>
          </div>

          {/* Coluna 3: Logo e Direitos */}
          <div className="flex flex-col items-center lg:items-end text-center lg:text-right space-y-6">
            <img src="/logo.png" alt="Logo Footer" className="w-20 h-20 opacity-30 grayscale hover:grayscale-0 transition-all rounded-full object-cover shadow-2xl" />
            <div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-2">
                © 2026 AD CAPITAL
              </p>
              <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest leading-loose">
                Direitos reservados<br/>
                <span className="opacity-40">Desenvolvido pelo AntiGravity AI</span>
              </p>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
