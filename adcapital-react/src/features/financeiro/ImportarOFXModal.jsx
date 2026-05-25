import React, { useState } from 'react';
import api from '../../api/config';
import financeiroService from '../../api/financeiroService';

export default function ImportarOFXModal({ isOpen, onClose, onSuccess, categoriasEntrada, categoriasSaida }) {
  const [loading, setLoading] = useState(false);
  const [transacoes, setTransacoes] = useState([]);
  const [selecionadas, setSelecionadas] = useState([]);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/financeiro/importar-ofx/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTransacoes(res.data);
      setSelecionadas(res.data.map(t => t.id_ofx));
    } catch (err) {
      alert("Erro ao ler arquivo OFX.");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    setLoading(true);
    try {
      const paraSalvar = transacoes.filter(t => selecionadas.includes(t.id_ofx));
      for (const t of paraSalvar) {
        await financeiroService.salvar(null, {
          data: t.data,
          valor: t.valor,
          descricao: t.descricao,
          tipo: t.tipo,
          categoria: t.tipo === 'ENTRADA' ? categoriasEntrada[0] || 'DÍZIMO' : categoriasSaida[0] || 'DIVERSOS'
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert("Erro ao salvar transações.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    if (selecionadas.includes(id)) {
      setSelecionadas(selecionadas.filter(s => s !== id));
    } else {
      setSelecionadas([...selecionadas, id]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800">Conciliação Bancária (OFX)</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Importe dados do seu banco</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {transacoes.length === 0 ? (
            <div className="text-center py-12">
              <input type="file" accept=".ofx" onChange={handleFileChange} id="ofx-file" className="hidden" />
              <label htmlFor="ofx-file" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer shadow-lg hover:scale-105 transition-all inline-block">
                {loading ? 'Processando...' : 'Selecionar Arquivo .OFX'}
              </label>
              <p className="mt-4 text-xs text-slate-400 font-medium">Seu arquivo não será enviado para nenhum servidor externo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transacoes.map((t) => (
                <div key={t.id_ofx} onClick={() => toggleSelect(t.id_ofx)} className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${selecionadas.includes(t.id_ofx) ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100'}`}>
                  <div className={`w-3 h-3 rounded-full ${t.tipo === 'ENTRADA' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-800 uppercase">{t.descricao}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{new Date(t.data).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${t.tipo === 'ENTRADA' ? 'text-emerald-600' : 'text-rose-600'}`}>R$ {t.valor.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${selecionadas.includes(t.id_ofx) ? 'bg-blue-600 border-blue-600' : 'border-slate-200'}`}>
                    {selecionadas.includes(t.id_ofx) && <span className="text-white text-[10px]">✓</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {transacoes.length > 0 && (
          <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50">
            <button onClick={handleSalvar} disabled={loading || selecionadas.length === 0} className="flex-1 bg-blue-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50">
              {loading ? 'Salvando...' : `Importar ${selecionadas.length} lançamentos`}
            </button>
            <button onClick={() => setTransacoes([])} className="px-8 bg-white text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200">Resetar</button>
          </div>
        )}
      </div>
    </div>
  );
}
