export default function MembroCard({ m, graus, onEdit, onDelete }) {
    return (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col justify-between h-full overflow-hidden hover:shadow-lg transition-shadow">
            <div>
                {/* PRIMEIRA LINHA: Cabeçalho com fundo mais escuro */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-blue-900 leading-tight">{m.nome}</h3>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">
                            {m.funcao || 'Membro'}
                        </p>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={onEdit}
                            className="p-2 bg-white text-blue-600 rounded-lg border border-slate-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Editar"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 bg-white text-red-600 rounded-lg border border-slate-200 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            title="Excluir"
                        >
                            🗑️
                        </button>
                    </div>
                </div>

                {/* CORPO DO CARD: Informações de contacto e endereço */}
                <div className="p-5 space-y-0.5">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <span className="text-lg opacity-70">📧</span>
                        <span className="truncate">{m.email || 'E-mail não cadastrado'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <span className="text-lg opacity-70">📞</span>
                        <span>{m.telefone || 'Não informado'}</span>
                    </div>

                    <div className="flex gap-2 text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-1 mt-1">
                        <span className="text-lg opacity-70">🏠</span>
                        <p>
                            {m.logradouro ? (
                                // Exemplo: "QD 207..., 1003 - APT - AGUAS CLARAS/DF"
                                `${m.logradouro}, ${m.numero || 'S/N'}`
                                + (m.complemento ? ` - ${m.complemento}` : '')
                                + (m.bairro ? ` - ${m.bairro}` : '')
                                + (m.cidade ? ` - ${m.cidade}` : '')
                            ) : (
                                <span className="italic text-slate-300">Endereço não cadastrado</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* RODAPÉ: Parentesco */}
            <div className="mx-6 mb-6 pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest italic">Família / Vínculos</p>
                <div className="flex flex-wrap gap-2">
                    {m.parentes && m.parentes.length > 0 ? (
                        m.parentes.map(p => (
                            <span key={p.id} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold border border-blue-100">
                                {graus.find(g => g.id === p.grau)?.nome || p.grau}: {p.nome_parente}
                            </span>
                        ))
                    ) : (
                        <span className="text-[10px] text-slate-300 uppercase font-medium tracking-tight">Sem vínculos registrados</span>
                    )}
                </div>
            </div>
        </div>
    );
}