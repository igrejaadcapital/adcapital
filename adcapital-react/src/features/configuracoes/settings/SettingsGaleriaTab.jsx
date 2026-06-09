import React from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { cn } from './settingsUi';

export default function SettingsGaleriaTab({
  galeria,
  handleAddFoto,
  handleDelFoto,
  deletandoId,
}) {
  return (
    <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="font-black uppercase text-xs tracking-widest text-slate-800">Galeria Institucional</h2>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Imagens exibidas no site público</p>
        </div>
        <label className="bg-blue-600 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3">
          <Plus size={16} /> Carregar Fotos
          <input type="file" className="hidden" multiple accept=".jpg,.jpeg,.png,.webp,.JPG,.JPEG,.PNG" onChange={handleAddFoto} />
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {galeria.map((f) => (
          <div key={f.id} className="aspect-square bg-slate-50 rounded-[2rem] overflow-hidden relative group border border-slate-100">
            <img src={f.imagem} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            <div className={cn(
              'absolute inset-0 transition-all flex flex-col items-center justify-center gap-2',
              deletandoId === f.id ? 'bg-white/90 opacity-100' : 'bg-rose-600/90 opacity-0 group-hover:opacity-100',
            )}
            >
              <button
                onClick={() => handleDelFoto(f.id)}
                disabled={deletandoId !== null}
                className={cn(
                  'font-black text-xs uppercase tracking-widest flex items-center gap-2',
                  deletandoId === f.id ? 'text-blue-600' : 'text-white',
                )}
              >
                {deletandoId === f.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deletandoId === f.id ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        ))}
        {galeria.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-bold uppercase tracking-widest text-xs">
            Nenhuma foto na galeria
          </div>
        )}
      </div>
    </section>
  );
}
