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
          <img src="/logo.png" alt="Logo AD Capital" className="w-24 h-24 mb-6 drop-shadow-2xl" />
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
            IGREJA <span className="text-blue-400">AD CAPITAL</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 max-w-2xl font-light italic">
            "Lugar de Restauração, Vida e Paz."
          </p>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open(config?.google_maps_url || '#', '_blank')}
            className="mt-10 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
          >
            <MapPin size={20} />
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

      {/* --- DÍZIMOS E OFERTAS --- */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <Heart className="w-16 h-16 mx-auto mb-6 text-white animate-pulse" />
            <h2 className="text-3xl md:text-5xl font-black mb-8 text-white uppercase italic">Ofertas e Dízimos</h2>
            <div className="space-y-6">
              <p className="text-blue-100 text-lg md:text-xl font-medium tracking-wide uppercase">
                {config?.beneficiario}
              </p>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl inline-block">
                <span className="text-blue-200 text-sm font-bold uppercase block mb-1">CHAVE PIX:</span>
                <p className="text-2xl md:text-3xl font-black text-white">{config?.pix_chave}</p>
              </div>
              <p className="text-blue-200 font-bold uppercase text-lg">{config?.banco_nome}</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER / CONTATO --- */}
      <footer className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
             <div className="bg-white p-2 rounded-3xl mb-8 shadow-2xl overflow-hidden w-[180px] h-[180px]">
                <img 
                  src={qrcode} 
                  alt="QR Code" 
                  className="w-full h-full object-contain"
                />
             </div>
             <p className="text-white font-black text-lg mb-4 uppercase tracking-tighter italic">Assembleia de Deus na Capital</p>
             <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">
               {config?.endereco_completo}
             </p>
             <div className="flex gap-4">
                <a href={config?.instagram_url} target="_blank" className="p-4 bg-slate-900 rounded-full hover:bg-blue-600 transition-all text-white">
                  <Instagram size={24} />
                </a>
                <a href={config?.youtube_url} target="_blank" className="p-4 bg-slate-900 rounded-full hover:bg-red-600 transition-all text-white">
                  <Youtube size={24} />
                </a>
                {config?.facebook_url && (
                  <a href={config?.facebook_url} target="_blank" className="p-4 bg-slate-900 rounded-full hover:bg-blue-800 transition-all text-white">
                    <Facebook size={24} />
                  </a>
                )}
             </div>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <img src="/logo.png" alt="Logo Footer" className="w-20 h-20 mb-6 opacity-30 grayscale hover:grayscale-0 transition-all" />
            <p className="text-slate-700 text-xs font-bold uppercase tracking-widest">
              © 2026 AD CAPITAL - Todos os direitos reservados
            </p>
            <p className="text-slate-800 text-[10px] mt-2">
              Desenvolvid pelo AntiGravity AI
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
