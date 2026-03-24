// src/components/Membros/ModalCadastro/ParentescoFormModal.jsx
export default function ParentescoFormModal({
    formData, membros, graus, atualizarParentesco, adicionarParentesco, removerParentesco, indiceFoco, setIndiceFoco 
}) {
    return (
        <div className="pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[11px] font-black text-blue-900/40 uppercase tracking-[0.2em]">👥 Vínculos Familiares</h3>
                <button
                    type="button"
                    onClick={adicionarParentesco}
                    className="text-xs bg-blue-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 shadow-md transition-all"
                >
                    + Adicionar Parente
                </button>
            </div>

            <div className="space-y-3">
                {formData.parentescos_novo?.map((p, index) => (
                    <div key={index} className="flex gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex-1 relative">
                            <input
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-bold focus:border-blue-400"
                                placeholder="Buscar nome..."
                                value={p.busca_termo || ''}
                                onFocus={() => setIndiceFoco(index)}
                                onChange={e => atualizarParentesco(index, 'busca_termo', e.target.value)}
                            />
                            {indiceFoco === index && p.busca_termo.length >= 2 && !p.parente_id && (
                                <div className="absolute z-50 w-full bg-white border border-blue-100 shadow-2xl rounded-xl mt-1 max-h-40 overflow-y-auto">
                                    {membros
                                        .filter(m => m.nome.toLowerCase().includes(p.busca_termo.toLowerCase()) && m.id !== formData.id)
                                        .map(m => (
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
                        </div>
                        <select
                            className="w-44 p-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-blue-900"
                            value={p.grau || ''}
                            onChange={e => atualizarParentesco(index, 'grau', e.target.value)}
                        >
                            <option value="">GRAU...</option>
                            {graus.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
                        </select>
                        <button
                            type="button"
                            onClick={() => removerParentesco(index)}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}