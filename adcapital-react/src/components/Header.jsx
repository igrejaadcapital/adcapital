export default function Header({ busca, setBusca, totalOriginal, totalFiltrado, onNovo }) {
    return (
        <header className="bg-blue-900 text-white shadow-xl mb-8">
            <div className="max-w-6xl mx-auto p-6">
                
                {/* PRIMEIRA LINHA: Título e Contadores */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter">AD CAPITAL</h1>
                        <p className="text-blue-200 text-sm font-medium">Gestão de Membros e Vínculos</p>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 flex flex-col items-center min-w-[100px]">
                            <span className="text-[10px] uppercase font-bold opacity-60 text-blue-200">Total</span>
                            <span className="text-xl font-black">{totalOriginal}</span>
                        </div>
                        <div className="bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/30 flex flex-col items-center min-w-[100px]">
                            <span className="text-[10px] uppercase font-bold text-emerald-300">Encontrados</span>
                            <span className="text-xl font-black text-emerald-400">{totalFiltrado}</span>
                        </div>
                    </div>
                </div>

                {/* SEGUNDA LINHA: Busca e Botão Novo */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="opacity-60 text-lg">🔍</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Pesquisar por nome ou função..."
                            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl outline-none focus:bg-white focus:text-slate-900 transition-all text-white placeholder:text-blue-200"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={onNovo}
                        className="w-full md:w-auto bg-white text-blue-900 px-8 py-3 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        + Novo Membro
                    </button>
                </div>
            </div>
        </header>
    );
}