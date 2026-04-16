// src/components/Membros/MembroFormFields.jsx
import React from 'react';

export default function MembroFormFields({ formData, handleChange, funcoes, aplicarMascaraTelefone, isPublic = false }) {
    return (
        <div className="space-y-8">
            {/* SEÇÃO 1: Dados Pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Nome Completo</label>
                    <input
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium uppercase"
                        value={formData.nome || ''}
                        onChange={e => handleChange('nome', e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">CPF (Obrigatório)</label>
                    <input
                        className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                        placeholder="000.000.000-00"
                        value={formData.cpf || ''}
                        onChange={e => {
                            let v = e.target.value.replace(/\D/g, "");
                            v = v.replace(/(\d{3})(\d)/, "$1.$2");
                            v = v.replace(/(\d{3})(\d)/, "$1.$2");
                            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                            handleChange('cpf', v.substring(0, 14));
                        }}
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
                        maxLength={20}
                        value={formData.telefone || ''}
                        onChange={e => handleChange('telefone', aplicarMascaraTelefone(e.target.value))}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Data de Nascimento</label>
                    <input
                        type="date"
                        className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        max={new Date().toISOString().split('T')[0]}
                        min="1900-01-01"
                        value={formData.data_nascimento || ''}
                        onChange={e => handleChange('data_nascimento', e.target.value)}
                    />
                </div>

                <div className="flex flex-col">
                     <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Gênero</label>
                     <select
                         className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                         value={formData.genero || 'M'}
                         onChange={e => handleChange('genero', e.target.value)}
                     >
                         <option value="M">Varão</option>
                         <option value="F">Varoa</option>
                     </select>
                </div>

                <div className="flex flex-col">
                     <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Estado Civil</label>
                     <select
                         className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                         value={formData.estado_civil || 'SOLTEIRO'}
                         onChange={e => handleChange('estado_civil', e.target.value)}
                     >
                         <option value="SOLTEIRO">Solteiro(a)</option>
                         <option value="CASADO">Casado(a)</option>
                         <option value="DIVORCIADO">Divorciado(a)</option>
                         <option value="VIUVO">Viúvo(a)</option>
                     </select>
                </div>

                <div className="flex flex-col">
                     <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Naturalidade (UF)</label>
                     <select
                         className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                         value={formData.naturalidade || ''}
                         onChange={e => handleChange('naturalidade', e.target.value)}
                     >
                         <option value="">Selecione...</option>
                         {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                             <option key={uf} value={uf}>{uf}</option>
                         ))}
                     </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Função na Igreja</label>
                    <select
                        className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold text-blue-900 mb-2"
                        value={funcoes.some(f => f.nome === formData.funcao) ? formData.funcao : (formData.funcao ? 'OUTRA' : 'Membro')}
                        onChange={e => {
                            const val = e.target.value;
                            if (val === 'OUTRA') {
                                handleChange('funcao', ''); // Limpa para digitar a nova
                            } else {
                                handleChange('funcao', val);
                            }
                        }}
                    >
                        {funcoes.map(f => <option key={f.id} value={f.nome}>{f.nome}</option>)}
                        {!isPublic && <option value="OUTRA">+ Cadastrar Nova Função...</option>}
                    </select>

                    {/* Campo extra que aparece apenas se o usuário escolher "Outra" ou se o valor atual não estiver na lista */}
                    {(!isPublic && (!funcoes.some(f => f.nome === formData.funcao) || formData.funcao === '')) && (
                        <input
                            type="text"
                            autoFocus
                            className="p-3 border-2 border-blue-500 rounded-xl outline-none animate-pulse bg-blue-50 placeholder:text-blue-300 font-bold text-blue-900"
                            placeholder="Digite o nome da nova função..."
                            value={formData.funcao || ''}
                            onChange={e => handleChange('funcao', e.target.value)}
                        />
                    )}
                </div>

                {!isPublic && (
                    <>
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
                    </>
                )}

                <div className="flex flex-col md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Motivo da Entrada</label>
                    <textarea
                        className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                        placeholder="Ex: Mudança de cidade, Reconciliação, etc."
                        value={formData.motivo_entrada || ''}
                        onChange={e => handleChange('motivo_entrada', e.target.value)}
                    />
                </div>

                {!isPublic && (
                    <div className="flex flex-col md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Motivo da Saída</label>
                        <textarea
                            className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                            placeholder="Descreva o motivo caso o membro esteja sendo desligado."
                            value={formData.motivo_saida || ''}
                            onChange={e => handleChange('motivo_saida', e.target.value)}
                        />
                    </div>
                )}

                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Unidade</label>
                    <input
                        className="p-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 cursor-not-allowed"
                        value={formData.unidade || 'Sede'}
                        readOnly
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Foto do Membro</label>
                    <input
                        type="file"
                        className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-[10px]"
                        accept="image/*"
                        onChange={e => handleChange('foto', e.target.files[0])}
                    />
                    {formData.foto && typeof formData.foto === 'string' && (
                        <div className="mt-2 flex items-center gap-2">
                            <img src={formData.foto} alt="Preview" className="w-10 h-10 rounded-full object-cover border" />
                            <span className="text-[10px] text-slate-400">Foto atual arquivada</span>
                        </div>
                    )}
                </div>
            </div>

            {/* SEÇÃO 2: Localização */}
            <div className="pt-6 border-t border-slate-100">
                <h3 className="text-[11px] font-black text-blue-900/40 uppercase mb-4 tracking-[0.2em]">📍 Localização</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        className="md:col-span-2 p-3 border border-slate-200 rounded-xl"
                        placeholder="Logradouro"
                        maxLength={255}
                        value={formData.logradouro || ''}
                        onChange={e => handleChange('logradouro', e.target.value)}
                    />
                    <input
                        className="p-3 border border-slate-200 rounded-xl"
                        placeholder="Nº"
                        maxLength={20}
                        value={formData.numero || ''}
                        onChange={e => handleChange('numero', e.target.value)}
                    />
                    <input
                        className="p-3 border border-slate-200 rounded-xl"
                        placeholder="Complemento"
                        maxLength={100}
                        value={formData.complemento || ''}
                        onChange={e => handleChange('complemento', e.target.value)}
                    />
                    <input
                        className="p-3 border border-slate-200 rounded-xl"
                        placeholder="Bairro"
                        maxLength={100}
                        value={formData.bairro || ''}
                        onChange={e => handleChange('bairro', e.target.value)}
                    />
                    <input
                        className="p-3 border border-slate-200 rounded-xl"
                        placeholder="Cidade"
                        maxLength={100}
                        value={formData.cidade || ''}
                        onChange={e => handleChange('cidade', e.target.value)}
                    />
                    <input
                        className="p-3 border border-slate-200 rounded-xl"
                        placeholder="UF"
                        maxLength={2}
                        value={formData.uf || ''}
                        onChange={e => handleChange('uf', e.target.value.toUpperCase())}
                    />
                    <input
                        className="p-3 border border-slate-200 rounded-xl"
                        placeholder="CEP"
                        maxLength={10}
                        value={formData.cep || ''}
                        onChange={e => handleChange('cep', e.target.value)}
                    />
                </div>
            </div>

            {/* SEÇÃO 3: Consentimento LGPD */}
            <div className="pt-6 border-t border-slate-100">
                <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex gap-4 items-start">
                    <div className="bg-blue-100 p-2 rounded-full hidden sm:block">
                        <span className="text-xl">📄</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-[11px] font-black text-blue-900 uppercase tracking-widest mb-2">Termo de Consentimento - LGPD</h3>
                        
                        {isPublic ? (
                            <p className="text-xs text-slate-500 leading-relaxed text-justify">
                                Ao finalizar este cadastro, você concorda com os termos da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018). 
                                Você autoriza a Igreja Evangélica Assembleia de Deus Ministério na Capital a coletar e armazenar seus dados para uso exclusivo eclesiástico.
                                <strong className="block mt-2">Um termo formal em PDF será gerado e enviado para o seu e-mail após a conclusão.</strong>
                            </p>
                        ) : (
                            <div className="space-y-4 pt-1">
                                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                                    Neste ambiente administrativo, você pode anexar o Termo LGPD <strong>assinado fisicamente</strong> pelo membro.
                                    Após o upload, o status muda para <span className="text-green-700 font-bold">✅ Salvo</span>.
                                </p>

                                {/* Status atual */}
                                {formData.lgpd_consentido ? (
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded-lg border border-green-200">
                                            ✅ Documento Assinado Recebido
                                        </span>
                                    </div>
                                ) : formData.lgpd_documento ? (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-lg border border-blue-200">
                                            📧 Termo Enviado — Aguardando Assinatura Física
                                        </span>
                                        <a href={formData.lgpd_documento} target="_blank" rel="noreferrer"
                                           className="text-[10px] font-bold text-blue-600 underline hover:text-blue-800">
                                            Ver PDF enviado
                                        </a>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-lg border border-amber-200">
                                            ⏳ Pendente — Nenhum documento gerado
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">
                                        Upload do Documento Assinado (PDF)
                                    </label>
                                    <input
                                        type="file"
                                        className="p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-[10px]"
                                        accept=".pdf,image/*"
                                        onChange={e => handleChange('lgpd_documento', e.target.files[0])}
                                    />
                                    <p className="text-[9px] text-slate-400 mt-1 ml-1">
                                        Aceita PDF ou foto legível do documento assinado. Ao salvar, o status passará para ✅ Salvo.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
