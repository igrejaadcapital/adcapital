import React, { useMemo } from 'react';
import { useAgenda } from '../../Agenda/useAgenda';
import StatusView from '../../Common/StatusView';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MemberAgenda() {
  const { eventos, carregando, error, buscarEventos } = useAgenda({ includeSyncStatus: false });

  // Sort events by date ascending and filter out past events (optional, but good for a member agenda)
  const proximosEventos = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return eventos
      .filter(ev => new Date(ev.data_fim || ev.data_inicio) >= hoje)
      .sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio));
  }, [eventos]);

  // Group events by month
  const eventosPorMes = useMemo(() => {
    const grupos = {};
    proximosEventos.forEach(ev => {
      const data = new Date(ev.data_inicio);
      const mesAno = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      if (!grupos[mesAno]) grupos[mesAno] = [];
      grupos[mesAno].push(ev);
    });
    return Object.entries(grupos).map(([mesAno, lista]) => ({
      mesAno: mesAno.charAt(0).toUpperCase() + mesAno.slice(1),
      eventos: lista
    }));
  }, [proximosEventos]);

  if (carregando && eventos.length === 0) {
    return <StatusView loading={true} message="Carregando programação oficial..." />;
  }

  if (error) {
    return <StatusView error={error} onRetry={buscarEventos} message="Erro ao carregar a agenda" />;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-8 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <CalendarIcon size={20} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black italic text-slate-800 tracking-tight">Programação da Igreja</h2>
            </div>
            <p className="text-slate-500 font-medium ml-1">Acompanhe nossos próximos cultos e eventos.</p>
          </div>
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest self-start md:self-auto border border-blue-100">
            {proximosEventos.length} Eventos Futuros
          </div>
        </div>

        {eventosPorMes.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-600 mb-2">Nenhum evento futuro</h3>
            <p className="text-slate-500">A agenda da igreja está livre no momento.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {eventosPorMes.map((grupo, gIndex) => (
              <div key={grupo.mesAno}>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
                  {grupo.mesAno}
                  <div className="h-px flex-1 bg-slate-100" />
                </h3>
                
                <div className="space-y-4">
                  {grupo.eventos.map((ev, eIndex) => {
                    const dataInicio = new Date(ev.data_inicio);
                    const dataFim = new Date(ev.data_fim);
                    const isSameDay = dataInicio.toDateString() === dataFim.toDateString();

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (gIndex * 0.1) + (eIndex * 0.05) }}
                        key={ev.id}
                        className="group flex flex-col md:flex-row gap-6 p-6 rounded-3xl border border-slate-100 bg-white hover:bg-blue-50/30 hover:border-blue-100 transition-all shadow-sm hover:shadow-md"
                      >
                        {/* Box de Data (Estilo Calendário Destacado) */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-blue-600 text-white w-20 h-24 rounded-2xl shadow-inner group-hover:bg-blue-700 transition-colors">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{dataInicio.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                          <span className="text-3xl font-black leading-none my-1">{dataInicio.getDate()}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{dataInicio.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
                        </div>

                        {/* Conteúdo do Evento */}
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="text-xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{ev.titulo}</h4>
                          {ev.descricao && (
                            <p className="text-slate-500 text-sm font-medium mb-4 line-clamp-2">{ev.descricao}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-4 mt-auto">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                              <Clock size={14} className="text-slate-400" />
                              {dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} 
                              {!isSameDay && ` até ${dataFim.toLocaleDateString('pt-BR')} ${dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                              <MapPin size={14} className="text-slate-400" />
                              AD Capital
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
