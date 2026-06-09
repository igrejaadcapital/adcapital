import React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { cn, Field } from './settingsUi';

export default function SettingsProgramacaoTab({
  programacao,
  novaProg,
  setNovaProg,
  handleSalvarProg,
  handleDelProg,
  deletandoId,
}) {
  return (
    <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50">
        <h2 className="font-black uppercase text-xs tracking-widest text-slate-800">Programação Semanal</h2>
      </div>
      <div className="p-8 bg-slate-50 border-b border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dia</label>
            <select
              className="p-4 bg-white border border-slate-200 rounded-2xl font-bold text-xs"
              value={novaProg.dia_semana}
              onChange={(e) => setNovaProg({ ...novaProg, dia_semana: parseInt(e.target.value, 10) })}
            >
              <option value="0">DOMINGO</option>
              <option value="1">SEGUNDA</option>
              <option value="2">TERÇA</option>
              <option value="3">QUARTA</option>
              <option value="4">QUINTA</option>
              <option value="5">SEXTA</option>
              <option value="6">SÁBADO</option>
            </select>
          </div>
          <div className="md:col-span-1"><Field label="Título do Evento" value={novaProg.titulo} onChange={(v) => setNovaProg({ ...novaProg, titulo: v })} /></div>
          <div className="md:col-span-1"><Field label="Horário" value={novaProg.horario} onChange={(v) => setNovaProg({ ...novaProg, horario: v })} /></div>
          <button onClick={handleSalvarProg} className="bg-slate-900 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest">ADICIONAR</button>
        </div>
      </div>
      <div className="p-8 space-y-4">
        {programacao.sort((a, b) => a.dia_semana - b.dia_semana).map((p) => (
          <div key={p.id} className="flex justify-between items-center p-5 bg-white border border-slate-100 rounded-[1.5rem] hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 transition-all group">
            <div>
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1 block">
                {['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'][p.dia_semana]}
              </span>
              <p className="font-bold text-slate-800">{p.titulo}</p>
              <p className="text-xs font-bold text-slate-400">{p.horario}</p>
            </div>
            <button
              onClick={() => handleDelProg(p.id)}
              disabled={deletandoId !== null}
              className={cn(
                'p-3 rounded-xl transition-all',
                deletandoId === p.id ? 'text-blue-600 bg-blue-50' : 'text-rose-500 opacity-20 group-hover:opacity-100 hover:bg-rose-50',
              )}
            >
              {deletandoId === p.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
