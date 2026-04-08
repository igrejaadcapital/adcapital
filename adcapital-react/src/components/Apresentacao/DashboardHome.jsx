import { AlertCircle, RefreshCcw, Loader2 } from 'lucide-react';

export default function DashboardHome({ totalMembros, saldoBancario, entradas, saidas, irParaMembros, irParaFinanceiro, loading, error, retry }) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2.5rem] border border-rose-100 shadow-xl space-y-6">
        <AlertCircle size={48} className="text-rose-500" />
        <div className="text-center">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">O servidou demorou a responder</h2>
          <p className="text-xs font-bold text-slate-400 uppercase mt-2">Isso acontece as vezes quando o sistema fica muito tempo parado.</p>
        </div>
        <button 
          onClick={retry}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all"
        >
          <RefreshCcw size={16} /> Tentar Novamente
        </button>
      </div>
    );
  }

  const dados = [
    { label: 'Entradas', valor: entradas || 0, cor: 'bg-emerald-500' },
    { label: 'Saídas', valor: saidas || 0, cor: 'bg-rose-500' },
  ];

  const maiorValor = Math.max(...dados.map(d => d.valor), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-[2.5rem]">
           <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      )}
      <div className="bg-blue-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <h1 className="text-4xl font-black tracking-tighter mb-2 italic">Olá, Analista! 👋</h1>
        <p className="text-blue-200 font-medium">O sistema está operacional com dados financeiros reais.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div onClick={irParaMembros} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm cursor-pointer hover:scale-[1.02] transition-all">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Membros Cadastrados</span>
            <h2 className="text-3xl font-black text-slate-800">{totalMembros}</h2>
          </div>

          <div onClick={irParaFinanceiro} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm cursor-pointer hover:scale-[1.02] transition-all">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Saldo Atual</span>
            <h2 className="text-3xl font-black text-slate-800">
              R$ {(saldoBancario || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">📊 Fluxo de Caixa Mensal</h3>
          <div className="space-y-6">
            {dados.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span>{item.label}</span>
                  <span className="font-black">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="h-4 bg-slate-50 rounded-full overflow-hidden">
                  <div className={`h-full ${item.cor} transition-all duration-1000`} style={{ width: `${(item.valor / maiorValor) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}