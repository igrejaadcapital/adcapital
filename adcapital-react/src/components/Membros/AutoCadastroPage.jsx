// src/components/Membros/AutoCadastroPage.jsx
import React, { useState } from 'react';
import api from '../../api/config';
import StatusView from '../Common/StatusView';
import MembroFormFields from './MembroFormFields';
import { Loader2 } from 'lucide-react';

// URL Base da API (FIXA para evitar confusão de domínios)
const BASE_HOST = 'https://api.adcapitaligreja.com.br/api';

export default function AutoCadastroPage() {
    // 1. Estratégia de Independência: Funções fixas para estabilidade, mas Pergunta dinâmica
    const [pergunta, setPergunta] = useState('Qual o seu melhor amigo?');
    const [portalAtivo, setPortalAtivo] = useState(true);
    const [funcoes] = useState([
        { id: 1, nome: 'Membro' },
        { id: 2, nome: 'Obreiro' },
        { id: 3, nome: 'Diácono' },
        { id: 4, nome: 'Presbítero' },
        { id: 5, nome: 'Evangelista' },
        { id: 6, nome: 'Missionário' },
        { id: 7, nome: 'Pastor' }
    ]);

    const [step, setStep] = useState('challenge'); // 'challenge', 'form', 'success'
    const [resposta, setResposta] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await api.get(`/configuracao-portal/publica/`);
                if (res.data) {
                    setPergunta(res.data.pergunta || 'Qual o seu melhor amigo?');
                    setPortalAtivo(res.data.is_ativo);
                }
            } catch (err) {
                console.error("Erro ao carregar config:", err);
                setError("O servidor está demorando a responder. Tente novamente em instantes.");
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);
    
    const [formData, setFormData] = useState({
        nome: '', cpf: '', email: '', telefone: '',
        genero: 'M', estado_civil: 'SOLTEIRO',
        data_nascimento: '', naturalidade: '',
        funcao: 'Membro', data_entrada: '',
        logradouro: '', numero: '',
        complemento: '', bairro: '', cidade: 'Brasília',
        uf: 'DF', cep: '', motivo_entrada: '', unidade: 'Sede',
        foto: null
    });

    const handleChallenge = async (e) => {
        e.preventDefault();
        if (!resposta.trim()) return;
        
        setLoading(true);
        setError('');
        try {
            const res = await api.post(`/v/`, { resposta });
            
            if (res.data && res.data.success === true) {
                setStep('form');
            } else {
                setError(res.data?.error || "Resposta incorreta.");
            }
        } catch (err) {
            console.error("Erro na verificação:", err);
            // Se o erro for 401, a resposta está errada. Se for 404 ou outro, é problema de rede/servidor.
            if (err.response?.status === 401) {
                setError(err.response?.data?.error || "Resposta incorreta. Verifique e tente novamente.");
            } else {
                setError("Erro ao conectar com o servidor. Verifique sua internet ou tente mais tarde.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const aplicarMascaraTelefone = (value) => {
        const v = value.replace(/\D/g, "");
        if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    };

    const [lgpdUrl, setLgpdUrl] = useState('');

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Usamos FormData para suportar upload de arquivos (foto)
            const data = new FormData();
            
            // Adicionamos todos os campos ao FormData
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (value !== null && value !== undefined) {
                    // Se for a foto, só adicionamos se houver um arquivo selecionado
                    if (key === 'foto') {
                        if (value instanceof File) data.append(key, value);
                    } else if (key === 'data_nascimento' && !value) {
                        // Ignora data de nascimento vazia
                    } else {
                        data.append(key, value);
                    }
                }
            });

            // Resposta de segurança necessária para o endpoint público
            data.append('sync_resposta', resposta);

            // Chamada para a Rota Direta de Auto-Cadastro
            const res = await api.post(`/c/`, data);
            
            if (res.data.success) {
                if (res.data.lgpd_url) {
                    setLgpdUrl(res.data.lgpd_url);
                    // Dispara o download imediatamente em uma nova aba para evitar pop-up blockers em alguns casos, ou na mesma.
                    window.open(res.data.lgpd_url, '_blank');
                }
                setStep('success');
            } else {
                setError(res.data.error || "Ocorreu um erro inesperado ao salvar.");
            }
        } catch (err) {
            console.error("Erro ao salvar:", err);
            const errorData = err.response?.data;
            if (errorData) {
                // Formata os erros do Django para exibição legível
                if (typeof errorData === 'object') {
                    const details = Object.entries(errorData)
                        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
                        .join(" | ");
                    setError(`Erro na validação: ${details}`);
                } else {
                    setError(`Erro do servidor: ${errorData}`);
                }
            } else if (err.message === 'Network Error') {
                setError("Erro de Rede: Verifique sua conexão com a internet.");
            } else {
                setError("Erro ao salvar cadastro. Verifique os campos ou se o CPF está correto.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (step === 'challenge') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <form onSubmit={handleChallenge} className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 flex flex-col items-center">
                    <img src="/logo.png" alt="Logo AD Capital" className="h-10 mb-6" />
                    <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tighter mb-2">Auto-Atendimento</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-8">Cadastro e Atualização de Dados</p>
                    
                    <div className="w-full space-y-4 relative min-h-[150px]">
                        <StatusView loading={loading && !resposta} />
                        {!portalAtivo && <p className="text-rose-500 text-xs font-black text-center mb-4 uppercase">Portal Desativado no Momento</p>}
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{pergunta}</label>
                        <input 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-blue-900 transition-all text-center uppercase"
                            value={resposta}
                            onChange={e => setResposta(e.target.value)}
                            placeholder="Sua resposta aqui..."
                            required
                            disabled={loading || !portalAtivo}
                            autoFocus
                        />
                        {error && <p className="text-rose-500 text-[10px] font-bold text-center mt-2 uppercase tracking-wide">{error}</p>}
                        
                        <button type="submit" disabled={loading || !portalAtivo} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Verificando...</span>
                                </>
                            ) : (
                                'Entrar no Formulário'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
                <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-emerald-100">
                    <div className="text-4xl mb-6">🎉</div>
                    <h1 className="text-2xl font-black text-emerald-900 uppercase tracking-tighter">Muito Obrigado!</h1>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed my-4">
                        Seu cadastro foi salvo com sucesso no banco de dados da AD Capital.
                    </p>
                    
                    {lgpdUrl && (
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 text-left">
                            <h3 className="text-blue-900 font-bold text-sm mb-2">📄 Termo de Proteção de Dados (LGPD)</h3>
                            <p className="text-xs text-blue-700 leading-relaxed mb-3">
                                O seu Termo LGPD foi gerado e o download deve iniciar automaticamente. 
                                Ele também foi enviado para o seu e-mail (caso informado). 
                                <strong> Por favor, guarde-o para seus registros ou envie para <a href="mailto:igrejaadcapital@gmail.com" className="underline font-bold">igrejaadcapital@gmail.com</a> caso solicitado.</strong>
                            </p>
                            <a 
                                href={lgpdUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="block w-full text-center py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-blue-700 transition"
                            >
                                Baixar Termo Novamente
                            </a>
                        </div>
                    )}

                    <button onClick={() => window.location.reload()} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 text-center">
                    <img src="/logo.png" alt="Logo AD Capital" className="h-10 mx-auto mb-6" />
                    <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Formulário de Cadastro</h1>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em] mt-2">Membro AD Capital Igreja</p>
                </header>
                
                <form onSubmit={handleSave} className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 relative">
                    {/* StatusView oculto quando temos animação no botão, para não poluir visualmente, ou mantido como overlay sutil */}
                    <StatusView loading={loading && !formData.nome} />
                    
                    <MembroFormFields 
                        formData={formData}
                        handleChange={handleChange}
                        funcoes={funcoes}
                        aplicarMascaraTelefone={aplicarMascaraTelefone}
                        isPublic={true}
                    />
                    
                    {error && (
                        <div className="mt-6 p-4 bg-rose-50 rounded-2xl border border-rose-100 italic">
                            <p className="text-rose-500 text-xs font-bold text-center">{error}</p>
                        </div>
                    )}
                    
                    <div className="mt-12 flex flex-col md:flex-row gap-4">
                        <button type="button" onClick={() => window.location.reload()} className="order-2 md:order-1 flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="order-1 md:order-2 flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Sincronizando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Finalizar Cadastro</span>
                                    <span>✅</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
