// src/components/Membros/ParentescoFormPublico.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/config';

export default function ParentescoFormPublico({
    formData, graus, atualizarParentesco, adicionarParentesco, removerParentesco
}) {
    const [indiceFoco, setIndiceFoco] = useState(null);
    const [resultadosBusca, setResultadosBusca] = useState({});
    const [loadingBusca, setLoadingBusca] = useState(false);

    // Efeito para buscar membros dinamicamente
    useEffect(() => {
        if (indiceFoco === null) return;
        
        const p = formData.parentescos_novo[indiceFoco];
        if (!p || !p.busca_termo || p.busca_termo.length < 3 || p.parente_id) {
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoadingBusca(true);
            try {
                const res = await api.get(`/opcoes-membros-busca/?q=${encodeURIComponent(p.busca_termo)}`);
                setResultadosBusca(prev => ({
                    ...prev,
                    [indiceFoco]: res.data
                }));
            } catch (err) {
                console.error("Erro ao buscar parentes", err);
            } finally {
                setLoadingBusca(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [indiceFoco, formData.parentescos_novo]);

    return (
        <div className="pt-6 border-t border-slate-100 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[11px] font-black text-blue-900/40 uppercase tracking-[0.2em]">👥 Vínculos Familiares (Opcional)</h3>
                <button
                    type="button"
                    onClick={adicionarParentesco}
                    className="text-xs bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-200 transition-all border border-blue-200"
                >
                    + Adicionar Parente
                </button>
            </div>

            <div className="space-y-3">
                {formData.parentescos_novo?.map((p, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex-1 w-full relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest block">Nome do Parente</label>
                            <input
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-bold focus:border-blue-400"
                                placeholder="Digite pelo menos 3 letras..."
                                value={p.busca_termo || ''}
                                onFocus={() => setIndiceFoco(index)}
                                onChange={e => {
                                    atualizarParentesco(index, 'busca_termo', e.target.value);
                                    // Se apagar o nome, limpa o ID também
                                    if (p.parente_id) atualizarParentesco(index, 'parente_id', null);
                                }}
                            />
                            {indiceFoco === index && p.busca_termo.length >= 3 && !p.parente_id && (
                                <div className="absolute z-50 w-full bg-white border border-blue-100 shadow-2xl rounded-xl mt-1 max-h-40 overflow-y-auto">
                                    {loadingBusca && <div className="p-3 text-xs text-slate-500 italic text-center">Buscando...</div>}
                                    {!loadingBusca && (!resultadosBusca[index] || resultadosBusca[index].length === 0) && (
                                        <div className="p-3 text-xs text-rose-500 text-center font-bold">Nenhum membro encontrado.</div>
                                    )}
                                    {!loadingBusca && resultadosBusca[index]?.map(m => (
                                        <div
                                            key={m.id}
                                            className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 text-xs font-bold text-slate-700"
                                            onClick={() => {
                                                atualizarParentesco(index, 'parente_id', m.id);
                                                atualizarParentesco(index, 'busca_termo', m.nome);
                                                setIndiceFoco(null);
                                            }}
                                        >
                                            {m.nome}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {p.parente_id && (
                                <p className="text-[10px] text-emerald-600 font-bold mt-1 ml-1">✅ Parente selecionado</p>
                            )}
                        </div>
                        <div className="w-full md:w-44">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest block">Grau</label>
                            <select
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-blue-900"
                                value={p.grau || ''}
                                onChange={e => atualizarParentesco(index, 'grau', e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                {graus.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={() => removerParentesco(index)}
                            className="p-3 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all self-end md:self-auto mt-2 md:mt-6 border border-transparent hover:border-rose-200"
                            title="Remover parente"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>
            
            {/* Fechar menu ao clicar fora */}
            {indiceFoco !== null && (
                <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setIndiceFoco(null)}
                />
            )}
        </div>
    );
}
