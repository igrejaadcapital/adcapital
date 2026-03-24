// src/components/Membros/ModalCadastro/CadastroMainFormModal.jsx
import MembroFormModal from './MembroFormModal';
import ParentescoFormModal from './ParentescoFormModal';
import { useCadastroMembroForm } from './useCadastroMembroForm';

export default function CadastroMainFormModal({ membro, membros, funcoes, graus, onClose, onSuccess }) {
    const {
        formData,
        handleChange,
        adicionarParentesco,
        removerParentesco,
        aplicarMascaraTelefone,
        atualizarParentesco,
        indiceFoco,
        setIndiceFoco,
        handleSubmit,
        getNomeGrau,
    } = useCadastroMembroForm(membro, membros, graus, onClose, onSuccess);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
                
                {/* CABEÇALHO */}
                <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-blue-900 tracking-tighter">
                            {formData.id ? '📝 EDITAR CADASTRO' : '✨ NOVO CADASTRO'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors text-2xl">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-8">
                    {/* PARTE 1: DADOS DO MEMBRO */}
                    <MembroFormModal 
                        formData={formData} 
                        handleChange={handleChange} 
                        funcoes={funcoes} 
                        aplicarMascaraTelefone={aplicarMascaraTelefone} 
                        getNomeGrau={getNomeGrau}
                    />

                    {/* PARTE 2: GESTÃO DE PARENTESCOS */}
                    <ParentescoFormModal 
                        formData={formData}
                        membros={membros}
                        graus={graus}
                        atualizarParentesco={atualizarParentesco}
                        adicionarParentesco={adicionarParentesco}
                        removerParentesco={removerParentesco}
                        indiceFoco={indiceFoco}
                        setIndiceFoco={setIndiceFoco}
                    />

                    {/* PARTE 3: OBSERVAÇÕES */}
                    <div className="pt-6 border-t border-slate-100">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Observações Adicionais</label>
                        <textarea
                            className="w-full p-4 border border-slate-200 rounded-2xl h-24 resize-none bg-slate-50/50 italic text-slate-600 text-sm focus:outline-none focus:border-blue-300"
                            placeholder="Informações relevantes..."
                            value={formData.observacoes || ''}
                            onChange={e => handleChange('observacoes', e.target.value)}
                        />
                    </div>

                    {/* AÇÕES FINAIS */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-slate-400 font-black text-xs uppercase tracking-widest">Cancelar</button>
                        <button type="submit" className="px-12 py-4 bg-blue-900 text-white font-black rounded-2xl shadow-xl uppercase text-xs tracking-[0.2em]">
                            {formData.id ? 'Salvar Alterações' : 'Finalizar Cadastro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}