import React from 'react';
import membroService from '../../api/membroService';

export default function GestaoFuncoesModal({ funcoes, onClose, onSuccess }) {
    const handleExcluir = async (id, nome) => {
        if (window.confirm(`Deseja realmente excluir a função "${nome}"? \n\nTodos os membros que possuem este cargo ficarão com o campo 'Função' em branco.`)) {
            try {
                await membroService.excluirFuncao(id);
                if (onSuccess) await onSuccess();
                alert('Função excluída com sucesso!');
            } catch (err) {
                alert('Erro ao excluir função. Verifique se ela está sendo usada como padrão do sistema.');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
                <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Gerenciar Cargos</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Lista de funções dinâmicas</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                    {funcoes.length === 0 ? (
                        <p className="text-center text-slate-400 py-8 italic font-medium">Nenhuma função personalizada cadastrada.</p>
                    ) : (
                        funcoes.map(f => (
                            <div key={f.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
                                <span className="font-bold text-blue-900">{f.nome}</span>
                                <button 
                                    onClick={() => handleExcluir(f.id, f.nome)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Excluir Categoria"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
