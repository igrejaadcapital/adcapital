import React, { useState } from 'react';
import { useAgenda } from './useAgenda';
import AgendaFormModal from './AgendaFormModal';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

export default function AgendaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' ou 'list'
  const { eventos, carregando, criarEvento, deletarEvento, sincronizar } = useAgenda();

  const handleSalvar = async (eventoData) => {
    const sucesso = await criarEvento(eventoData);
    if (sucesso) setIsModalOpen(false);
  };

  // Converte eventos do banco para o formato do FullCalendar
  const calendarEvents = eventos.map(ev => ({
    id: ev.id,
    title: ev.titulo,
    start: ev.data_inicio,
    end: ev.data_fim,
    extendedProps: {
      descricao: ev.descricao,
      google_event_id: ev.google_event_id,
      ...ev
    },
    backgroundColor: ev.google_event_id ? '#3b82f6' : '#94a3b8', // Blue if synced, Slate if not
    borderColor: 'transparent'
  }));

  const handleEventClick = (info) => {
    const ev = info.event.extendedProps;
    if (window.confirm(`Deseja excluir o evento "${info.event.title}"?`)) {
      deletarEvento(info.event.id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header com Controles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Agenda Oficial (Google Calendar)</h2>
          <p className="text-sm text-slate-500 font-medium">Sincronização em tempo real com o Google Calendar da Igreja.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Toggle de Visualização */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mr-2">
            <button 
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Calendário
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Lista
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 flex-1 md:flex-none"
            disabled={carregando}
          >
            {carregando ? 'Processando...' : '+ Adicionar Evento'}
          </button>
        </div>
      </div>

      {/* Área Principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
        {carregando && eventos.length === 0 ? (
           <div className="p-12 text-center text-slate-400 font-bold animate-pulse">Sincronizando com o Google...</div>
        ) : viewMode === 'list' ? (
          /* Visualização em Lista (Legado melhorado) */
          <div className="divide-y divide-slate-100">
            {eventos.length === 0 ? (
              <EmptyState />
            ) : (
              eventos.map((ev) => (
                <ListItem key={ev.id} ev={ev} deletarEvento={deletarEvento} sincronizar={sincronizar} />
              ))
            )}
          </div>
        ) : (
          /* Visualização em Calendário (Nova) */
          <div className="p-4 md:p-6 calendar-container">
            <style>{`
              .fc { --fc-border-color: #f1f5f9; --fc-button-bg-color: #3b82f6; --fc-button-border-color: #3b82f6; --fc-button-hover-bg-color: #2563eb; font-family: inherit; }
              .fc .fc-toolbar-title { font-weight: 900; color: #1e293b; font-size: 1.25rem; text-transform: capitalize; }
              .fc .fc-col-header-cell-cushion { color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; padding: 10px 0; }
              .fc .fc-daygrid-day-number { color: #94a3b8; font-weight: 600; padding: 8px; font-size: 0.85rem; }
              .fc .fc-day-today { background: #f8fafc !important; }
              .fc .fc-event { border-radius: 6px; padding: 2px 4px; font-weight: 600; font-size: 0.75rem; cursor: pointer; transition: transform 0.1s; }
              .fc .fc-event:hover { transform: scale(1.02); }
              .fc-theme-standard td, .fc-theme-standard th { border-color: #f1f5f9; }
            `}</style>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={ptBrLocale}
              events={calendarEvents}
              eventClick={handleEventClick}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: ''
              }}
              height="auto"
              dayMaxEvents={true}
              fixedWeekCount={false}
            />
          </div>
        )}
      </div>

      {isModalOpen && (
        <AgendaFormModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSalvar}
          carregando={carregando}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-16 text-center">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-500 text-3xl shadow-inner">📅</div>
      <h3 className="text-xl font-black text-slate-700 mb-2">A Agenda está livre</h3>
      <p className="text-slate-500 font-medium max-w-sm mx-auto">Cadastre novos eventos para preencher o calendário oficial da Igreja.</p>
    </div>
  );
}

function ListItem({ ev, deletarEvento, sincronizar }) {
  return (
    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-slate-800">{ev.titulo}</h3>
        {ev.descricao && <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">{ev.descricao}</p>}
        
        <div className="flex flex-wrap gap-3 mt-4 text-xs font-bold">
          <span className="bg-white border border-slate-200 shadow-sm px-3 pt-1 pb-0.5 rounded-xl flex items-center gap-1 text-slate-600">
             <span className="text-slate-400">INÍCIO: </span>
             {new Date(ev.data_inicio).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' }).toUpperCase()}
          </span>
          <span className="bg-white border border-slate-200 shadow-sm px-3 pt-1 pb-0.5 rounded-xl flex items-center gap-1 text-slate-600">
             <span className="text-slate-400">FIM: </span>
             {new Date(ev.data_fim).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' }).toUpperCase()}
          </span>
          {ev.google_event_id ? (
            <span className="text-green-700 bg-green-50 px-3 pt-1 pb-0.5 rounded-xl flex items-center gap-1">Sincronizado ✅</span>
          ) : (
            <button 
              onClick={() => sincronizar(ev.id, ev)}
              className="text-amber-700 bg-amber-50 px-3 pt-1 pb-0.5 rounded-xl flex items-center gap-1 hover:bg-amber-100 transition-colors"
            >
              Não Sincronizado (Tentar Agora 🔄)
            </button>
          )}
        </div>
      </div>
      
      <button
        onClick={() => deletarEvento(ev.id)}
        className="px-5 py-2.5 bg-red-50 text-red-600 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-red-100 transition-colors active:scale-95 whitespace-nowrap self-start md:self-center"
      >
        Excluir e Avisar
      </button>
    </div>
  );
}
