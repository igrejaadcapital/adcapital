import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Plus, Trash2, Loader2, CheckCircle, ExternalLink } from 'lucide-react';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function TechItem({ label, value }) {
  return (
    <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl border border-slate-50">
       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</span>
       <span className="text-xs font-bold text-slate-700">{value}</span>
    </div>
  );
}

export function UrlItem({ label, url }) {
  return (
    <a href={`https://${url}`} target="_blank" rel="noreferrer" className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group">
       <div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{label}</p>
          <p className="text-xs font-mono font-bold text-blue-600">{url}</p>
       </div>
       <ExternalLink size={14} className="text-slate-200 group-hover:text-blue-400 transition-all" />
    </a>
  );
}

export function DataCard({ title, fields }) {
  return (
    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3">
       <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{title}</h4>
       <div className="space-y-1.5">
          {fields.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
               <div className="w-1 h-1 bg-slate-300 rounded-full" />
               {f}
            </div>
          ))}
       </div>
    </div>
  );
}

export function ServiceCard({ name, role, detail, url, color }) {
  const colors = {
    green: "border-emerald-200 bg-emerald-50/30",
    orange: "border-orange-200 bg-orange-50/30",
    blue: "border-blue-200 bg-blue-50/30",
    emerald: "border-emerald-200 bg-emerald-50/30",
    slate: "border-slate-200 bg-slate-50/30",
  };
  return (
    <a href={`https://${url}`} target="_blank" rel="noreferrer" className={cn("p-5 rounded-2xl border space-y-2 hover:shadow-md transition-all group", colors[color] || colors.blue)}>
       <div className="flex justify-between items-start">
          <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">{name}</h4>
          <ExternalLink size={12} className="text-slate-300 group-hover:text-blue-400 transition-all" />
       </div>
       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{role}</p>
       <p className="text-[10px] font-bold text-slate-400 leading-relaxed">{detail}</p>
    </a>
  );
}

export function EnvItem({ name, desc }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-50">
       <code className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-md whitespace-nowrap">{name}</code>
       <span className="text-[10px] font-bold text-slate-400">{desc}</span>
    </div>
  );
}

export function ArquiteturaItem({ icon, title, subtitle, text }) {
  return (
    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-2">
       <div className="flex items-center gap-3 text-blue-600 mb-2">
         {icon}
         <span className="font-black uppercase text-[10px] tracking-widest">{title}</span>
       </div>
       <p className="font-bold text-xs text-slate-800">{subtitle}</p>
       <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{text}</p>
    </div>
  );
}

export function Field({ label, value, onChange, onBlur, isTextArea, isUpper }) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">{label}</label>
      {isTextArea ? (
        <textarea className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]" 
          value={value || ''} 
          onChange={e => onChange(e.target.value)} 
          onBlur={e => onBlur && onBlur(e.target.value)} 
        />
      ) : (
        <input className={cn("p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all", isUpper && "uppercase")} 
          value={value || ''} 
          onChange={e => onChange(e.target.value)} 
          onBlur={e => onBlur && onBlur(e.target.value)} 
        />
      )}
    </div>
  );
}

export function SettingsBox({ title, color, data, onAdd, onDelete }) {
  const [val, setVal] = useState('');
  const [deletandoId, setDeletandoId] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  const styles = {
    blue: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-100" },
    emerald: { bg: "bg-emerald-600", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-100" },
    rose: { bg: "bg-rose-600", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-100" }
  };
  
  const currentStyle = styles[color] || styles.blue;

  const handleExcluir = async (id) => {
    if (confirm('Deseja realmente excluir este item?')) {
      setDeletandoId(id);
      try {
        await onDelete(id);
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir. Tente novamente.");
      } finally {
        setDeletandoId(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden h-[500px] flex flex-col relative">
      <div className={cn("p-6 text-center font-black uppercase text-xs tracking-widest text-white relative transition-all", currentStyle.bg, sucesso && "bg-emerald-500")}>
        {sucesso ? (
          <div className="flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle size={14} /> Sucesso!
          </div>
        ) : title}
      </div>
      
      <div className="p-6">
        <div className={cn("flex items-center gap-2 p-1.5 rounded-2xl border transition-all focus-within:ring-4", currentStyle.light, currentStyle.border, color === 'blue' ? 'focus-within:ring-blue-500/10' : color === 'emerald' ? 'focus-within:ring-emerald-500/10' : 'focus-within:ring-rose-500/10')}>
           <input 
             type="text" 
             className="flex-1 bg-transparent p-2.5 font-bold text-sm outline-none px-4 text-slate-700 placeholder:text-slate-300" 
             placeholder="Novo item..." 
             value={val} 
             onChange={e => setVal(e.target.value)}
             onKeyDown={e => {
                if (e.key === 'Enter' && val) {
                  onAdd(val);
                  setVal('');
                }
             }}
           />
           <button 
             onClick={() => {if(val) onAdd(val); setVal('')}} 
             className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-sm", currentStyle.bg)}
           >
              <Plus size={20} strokeWidth={3} />
           </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-2">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
             <Plus size={40} className="mb-2" />
             <p className="text-[10px] font-black uppercase tracking-widest">Nenhum item</p>
          </div>
        ) : (
          data.map(d => (
            <div key={d.id} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-50 hover:bg-white hover:border-slate-100 hover:shadow-sm transition-all group">
               <span className={cn("font-bold text-sm transition-all", deletandoId === d.id ? "text-slate-300 italic" : "text-slate-700")}>
                {d.nome}
               </span>
               <button 
                 onClick={() => handleExcluir(d.id)} 
                 disabled={deletandoId !== null}
                 className={cn("p-2 rounded-lg transition-all", 
                   deletandoId === d.id ? "text-blue-600 bg-blue-50" : "text-slate-200 hover:text-rose-500 hover:bg-rose-50"
                 )}
               >
                  {deletandoId === d.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
               </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
