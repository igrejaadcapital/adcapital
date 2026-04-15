import { Loader2 } from 'lucide-react';

export default function MembroCard({ m, graus, onEdit, onDelete, deletandoId }) {
    const isDeleting = deletandoId === m.id;

    return (
        <div className={`bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col justify-between h-full overflow-hidden transition-all ${isDeleting ? 'opacity-40 grayscale-[0.5] scale-[0.98]' : 'hover:shadow-lg transition-shadow'}`}>
            <div>
                {/* PRIMEIRA LINHA: Cabeçalho com fundo mais escuro */}
                <div className={`px-6 py-4 border-b border-slate-100 flex justify-between items-start gap-4 transition-colors ${isDeleting ? 'bg-rose-50' : 'bg-slate-50'}`}>
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="shrink-0">
                            {m.foto ? (
                                <img
                                    src={m.foto}
                                    alt={m.nome}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                                    <span className="text-white font-black text-lg leading-none">
                                        {m.nome?.charAt(0) || '?'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-bold leading-tight transition-all truncate ${isDeleting ? 'text-slate-400 italic' : 'text-blue-900'}`}>{m.nome}</h3>
                            <div className="flex gap-2 items-center mt-1 flex-wrap">
                                 <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                                     {m.funcao || 'Membro'}
                                 </p>
                                 {m.lgpd_consentido ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-700 text-[9px] font-black uppercase rounded border border-green-200" title="Documento assinado recebido">
                                       ✅ LGPD OK
                                    </span>
                                 ) : m.lgpd_documento ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded border border-blue-200" title="Termo enviado — aguardando assinatura">
                                       📧 Enviado
                                    </span>
                                 ) : (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-black uppercase rounded border border-amber-200" title="Termo não assinado">
                                       ⏳ Pendente
                                    </span>
                                 )}
                            </div>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={onEdit}
                            disabled={isDeleting}
                            className="p-2 bg-white text-blue-600 rounded-lg border border-slate-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm disabled:opacity-20"
                            title="Editar"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={onDelete}
                            disabled={isDeleting}
                            className={`p-2 rounded-lg border transition-all shadow-sm flex items-center justify-center min-w-[38px] ${
                                isDeleting 
                                    ? 'bg-blue-50 border-blue-200 text-blue-600' 
                                    : 'bg-white text-red-600 border-slate-200 hover:bg-red-600 hover:text-white'
                            }`}
                            title="Excluir"
                        >
                            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : '🗑️'}
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