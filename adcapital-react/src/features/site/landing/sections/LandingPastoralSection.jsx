import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare } from 'lucide-react';
import { cn } from '../landingUtils';

const LandingPastoralSection = ({
  config,
  curtidas,
  jaCurtiu,
  handleCurtirPalavra,
  comentarios,
  novoNome,
  setNovoNome,
  novoTexto,
  setNovoTexto,
  enviando,
  handleEnviarComentario,
}) => {
  if (!config?.pastoral_texto) return null;

  return (
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
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-800 pt-6">
            <p className="font-bold text-white text-xl">— {config.pastor_nome}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCurtirPalavra}
              disabled={jaCurtiu}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-full font-bold transition-all border shadow-lg cursor-pointer",
                jaCurtiu
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
              )}
              title={jaCurtiu ? "Você já curtiu esta mensagem" : "Curtir mensagem"}
            >
              <Heart size={22} className={cn("transition-all duration-300", jaCurtiu ? "fill-red-500 text-red-500 scale-110" : "")} />
              <span className="text-lg">{curtidas} {curtidas === 1 ? 'curtida' : 'curtidas'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Seção de Comentários */}
      <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-sm shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <MessageSquare size={20} className="text-blue-500" />
          Deixe uma mensagem para o Pastor
        </h3>

        <form onSubmit={handleEnviarComentario} className="mb-10 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Seu nome"
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
            <textarea
              placeholder="O que achou da mensagem?"
              value={novoTexto}
              onChange={e => setNovoTexto(e.target.value)}
              rows="3"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={enviando}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-colors w-full sm:w-auto"
          >
            {enviando ? 'Enviando...' : 'Enviar Mensagem'}
          </button>
        </form>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {comentarios.length === 0 ? (
            <p className="text-slate-500 text-center py-4 italic font-medium">Seja o primeiro a deixar uma mensagem!</p>
          ) : (
            comentarios.map(c => (
              <div key={c.id} className="bg-slate-950/50 border border-slate-800 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-blue-400">{c.nome}</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    {new Date(c.criado_em).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{c.texto}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default LandingPastoralSection;
