import React from 'react';
import { Trash2 } from 'lucide-react';
import { Field } from './settingsUi';

export default function SettingsDevocionaisTab({
  novaDevocional,
  setNovaDevocional,
  devocionais,
  handleSalvarDevocional,
  handleDelDevocional,
}) {
  return (
    <section className="space-y-6">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-black uppercase text-xs tracking-widest text-slate-800">Nova Devocional</h2>
        </div>
        <div className="p-8 space-y-4">
          <Field label="Título" value={novaDevocional.titulo} onChange={v => setNovaDevocional({...novaDevocional, titulo: v})} />
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conteúdo da Mensagem</label>
            <textarea 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[200px] text-sm focus:outline-none focus:border-blue-500 transition-all"
              value={novaDevocional.conteudo}
              onChange={e => setNovaDevocional({...novaDevocional, conteudo: e.target.value})}
              placeholder="Escreva a palavra diária aqui..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Autor" value={novaDevocional.autor} onChange={v => setNovaDevocional({...novaDevocional, autor: v})} />
          </div>
          <button onClick={handleSalvarDevocional} className="w-full bg-blue-600 text-white p-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">
            Publicar Devocional
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-black uppercase text-[10px] tracking-widest text-slate-400 px-4">Histórico de Mensagens</h3>
        {devocionais.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
            <p className="text-slate-400 font-bold">Nenhuma devocional publicada ainda.</p>
          </div>
        ) : (
          devocionais.map(d => (
            <div key={d.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase tracking-tighter">
                    {new Date(d.data_publicacao).toLocaleDateString()}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Por: {d.autor}</span>
                </div>
                <h4 className="font-bold text-slate-800 mb-1">{d.titulo}</h4>
                <p className="text-sm text-slate-500 line-clamp-2">{d.conteudo}</p>
              </div>
              <button onClick={() => handleDelDevocional(d.id)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
