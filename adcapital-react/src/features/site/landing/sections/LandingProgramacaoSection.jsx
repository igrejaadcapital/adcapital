import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { diasSemana } from '../landingUtils';

const LandingProgramacaoSection = ({ programacao }) => (
  <section id="programacao" className="py-20 bg-slate-900/30">
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
);

export default LandingProgramacaoSection;
