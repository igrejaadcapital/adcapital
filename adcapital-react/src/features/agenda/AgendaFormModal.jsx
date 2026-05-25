import React, { useState } from 'react';

export default function AgendaFormModal({ onClose, onSave, carregando }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.data_inicio || !formData.data_fim) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Criar Evento</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Este cadastro será publicado simultaneamente no Google Calendar.</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-200 transition-colors shadow-sm">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2">Evento / Motivo *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ex: Culto de Domingo, Teste, Reunião de Líderes"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1rem] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-800 transition-all outline-none placeholder:text-slate-300 placeholder:font-medium"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2">Início (Data e Hora) *</label>
              <input
                type="datetime-local"
                name="data_inicio"
                value={formData.data_inicio}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1rem] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-800 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2">Término Previsto *</label>
              <input
                type="datetime-local"
                name="data_fim"
                value={formData.data_fim}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1rem] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-800 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2">Link Extra ou Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows="3"
              placeholder="Ex: Vai ser um culto especial com a banda da igreja, link do zoom etc."
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1rem] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-slate-800 resize-none transition-all outline-none placeholder:text-slate-300"
            ></textarea>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 px-6 py-4 font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-[1rem] transition-colors"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="w-2/3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[1rem] shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              {carregando ? 'Publicando...' : 'Salvar no Servidor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
