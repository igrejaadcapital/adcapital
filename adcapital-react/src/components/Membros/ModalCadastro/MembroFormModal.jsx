// src/components/ModalCadastro/MembroFormModal.jsx
export default function MembroFormModal({ formData, handleChange, funcoes, aplicarMascaraTelefone }) {
    return (
        <div className="space-y-8">
            {/* SEÇÃO 1: Dados Pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Nome Completo</label>
                    <input
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        value={formData.nome || ''}
                        onChange={e => handleChange('nome', e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">E-mail</label>
                    <input
                        className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        type="email"
                        value={formData.email || ''}
                        onChange={e => handleChange('email', e.target.value)}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Telefone</label>
                    <input
                        className="p-3 border border-slate-200 rounded-xl font-mono"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone || ''}
                        onChange={e => handleChange('telefone', aplicarMascaraTelefone(e.target.value))}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Data de Nascimento</label>
                    <input
                        type="date"
                        className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.data_nascimento || ''}
                        onChange={e => handleChange('data_nascimento', e.target.value)}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Função na Igreja</label>
                    <input
                        list="lista-funcoes"
                        className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold text-blue-900"
                        value={formData.funcao || ''}
                        onChange={e => handleChange('funcao', e.target.value)}
                        placeholder="Selecione ou digite..."
                    />
                    <datalist id="lista-funcoes">
                        {funcoes.map(f => <option key={f.id} value={f.nome} />)}
                    </datalist>
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Data de Entrada</label>
                    <input
                        type="date"
                        className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.data_entrada || ''}
                        onChange={e => handleChange('data_entrada', e.target.value)}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Data de Saída (Se aplicável)</label>
                    <input
                        type="date"
                        className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.data_saida || ''}
                        onChange={e => handleChange('data_saida', e.target.value)}
                    />
                </div>
            </div>

            {/* SEÇÃO 2: Localização */}
            <div className="pt-6 border-t border-slate-100">
                <h3 className="text-[11px] font-black text-blue-900/40 uppercase mb-4 tracking-[0.2em]">📍 Localização</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        className="md:col-span-2 p-3 border border-slate-200 rounded-xl"
                        placeholder="Logradouro"
                        value={formData.logradouro || ''}
                        onChange={e => handleChange('logradouro', e.target.value)}
                    />
                    <input
                        className="p-3 border border-slate-200 rounded-xl"
                        placeholder="Nº"
                        value={formData.numero || ''}
                        onChange={e => handleChange('numero', e.target.value)}
                    />
                    <input
                        className="p-3 border border-slate-200 rounded-xl"
                        placeholder="Complemento"
                        value={formData.complemento || ''}
                        onChange={e => handleChange('complemento', e.target.value)}
                    />
                    <input
                        className="p-3 border border-slate-200 rounded-xl"
                        placeholder="Bairro"
                        value={formData.bairro || ''}
                        onChange={e => handleChange('bairro', e.target.value)}
                    />
                    <input
                        className="p-3 border border-slate-200 rounded-xl"
                        placeholder="Cidade"
                        value={formData.cidade || ''}
                        onChange={e => handleChange('cidade', e.target.value)}
                    />
                    <input
                        className="p-3 border border-slate-200 rounded-xl"
                        placeholder="UF"
                        value={formData.uf || ''}
                        onChange={e => handleChange('uf', e.target.value)}
                    />
                    <input
                        className="p-3 border border-slate-200 rounded-xl"
                        placeholder="CEP"
                        value={formData.cep || ''}
                        onChange={e => handleChange('cep', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}