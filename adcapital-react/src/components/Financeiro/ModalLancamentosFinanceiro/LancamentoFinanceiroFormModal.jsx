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
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</label>
                            <button 
                                type="button" 
                                onClick={() => setMostrarCampoNovo(!mostrarCampoNovo)} 
                                className="text-[9px] font-black text-blue-600 uppercase hover:underline"
                            >
                                {mostrarCampoNovo ? 'Voltar para lista' : '+ Criar Nova'}
                            </button>
                        </div>

                        {mostrarCampoNovo ? (
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Nome da categoria..." 
                                    className="flex-1 bg-blue-50 border-none rounded-2xl p-4 font-bold text-blue-900"
                                    value={novaCategoria} 
                                    onChange={(e) => setNovaCategoria(e.target.value)} 
                                />
                                <button 
                                    type="button" 
                                    onClick={adicionarNovaCategoria} 
                                    className="bg-blue-600 text-white px-4 rounded-2xl font-black text-xs"
                                >OK</button>
                            </div>
                        ) : (
                            <select 
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 appearance-none cursor-pointer"
                                value={formData.categoria} 
                                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                            >
                                {categoriasForm.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
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

                    {/* Botões de Ação */}
                    <div className="flex gap-3 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className={`flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase text-white shadow-lg transition-all ${tipo === 'ENTRADA' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-red-500 shadow-red-100'}`}
                        >
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}