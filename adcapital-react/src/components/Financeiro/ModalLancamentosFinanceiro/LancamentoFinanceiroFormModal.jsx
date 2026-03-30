// src/components/Financeiro/ModalLancamentosFinanceiro/LancamentoFinanceiroFormModal.jsx
import { useLancamentoFinanceiroForm } from './useLancamentoFinanceiroForm';

export default function LancamentoFinanceiroFormModal({ tipo, onClose, onSave, categorias, onAdicionarCategoria, lancamento }) {
    const {
        formData,
        setFormData,
        categorias: categoriasForm,
        mostrarCampoNovo,
        setMostrarCampoNovo,
        novaCategoria,
        setNovaCategoria,
        valorExibicao,
        handleValorChange,
        adicionarNovaCategoria,
        handleSubmit
    } = useLancamentoFinanceiroForm(tipo, onSave, onClose, categorias, onAdicionarCategoria, lancamento);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Cabeçalho */}
                <div className={`p-8 ${tipo === 'ENTRADA' ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">
                        {tipo === 'ENTRADA' ? 'Novo Depósito' : 'Novo Saque'}
                    </h2>
                    <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest mt-1">Lançamento Financeiro</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    
                    {/* Data */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                        <input 
                            type="date" 
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
                            value={formData.data} 
                            onChange={(e) => setFormData({...formData, data: e.target.value})} 
                        />
                    </div>

                    {/* Categoria / Novo Tipo */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                        
                        <select 
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 appearance-none cursor-pointer mb-2"
                            value={categorias.includes(formData.categoria) ? formData.categoria : (formData.categoria ? 'OUTRA' : categorias[0])}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'OUTRA') {
                                    setFormData({...formData, categoria: ''});
                                } else {
                                    setFormData({...formData, categoria: val});
                                }
                            }}
                        >
                            {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            <option value="OUTRA">+ Nova Categoria...</option>
                        </select>

                        {/* Campo extra para nova categoria (Padronizado com Membros) */}
                        {(!categorias.includes(formData.categoria) || formData.categoria === '') && (
                            <input 
                                type="text" 
                                autoFocus
                                placeholder="Digite o nome da nova categoria..." 
                                className={`w-full border-2 ${tipo === 'ENTRADA' ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-red-500 bg-red-50 text-red-900'} rounded-2xl p-4 font-bold outline-none animate-pulse`}
                                value={formData.categoria} 
                                onChange={(e) => setFormData({...formData, categoria: e.target.value})} 
                            />
                        )}
                    </div>

                    {/* Descrição Livre */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição / Detalhes</label>
                        <input 
                            type="text" 
                            placeholder="Ex: Doação para filantropia..." 
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
                            value={formData.descricao} 
                            onChange={(e) => setFormData({...formData, descricao: e.target.value})} 
                        />
                    </div>

                    {/* Valor com Máscara */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor (R$)</label>
                        <input 
                            type="text"
                            inputMode="numeric"
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-2xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                            value={valorExibicao}
                            onChange={handleValorChange}
                        />
                    </div>

                    {/* Comprovante / Arquivo */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comprovante (Imagem/PDF)</label>
                        <input 
                            type="file" 
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-all"
                            onChange={(e) => setFormData({...formData, comprovante: e.target.files[0]})}
                        />
                        {lancamento?.comprovante && (
                            <a href={lancamento.comprovante} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 font-bold underline ml-1 inline-block mt-2">
                                📎 Ver Comprovante Anexado
                            </a>
                        )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-col gap-3 pt-4">
                        <button 
                            type="submit" 
                            className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase text-white shadow-lg transition-all ${tipo === 'ENTRADA' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100' : 'bg-red-500 hover:bg-red-600 shadow-red-100'}`}
                        >
                            Confirmar Lançamento
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="w-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}