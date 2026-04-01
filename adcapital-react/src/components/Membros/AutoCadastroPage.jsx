// src/components/Membros/AutoCadastroPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import MembroFormFields from './MembroFormFields';

// URL Base da API (sem o /api no final para as rotas diretas)
const BASE_HOST = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://api.adcapitaligreja.com.br';

export default function AutoCadastroPage() {
    // 1. Estratégia de Independência: Pergunta e Funções fixas para evitar erros de carregamento
    const [config] = useState({ is_ativo: true, pergunta: 'Qual o seu melhor amigo?' });
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
    
    const [formData, setFormData] = useState({
        nome: '', cpf: '', email: '', telefone: '',
        genero: 'M', data_nascimento: '',
        funcao: 'Membro', logradouro: '', numero: '',
        complemento: '', bairro: '', cidade: 'Brasília',
        uf: 'DF', cep: ''
    });

    const handleChallenge = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Chamada para a nova Rota Direta (bypassing DRF)
            const res = await axios.post(`${BASE_HOST}/portal/verificar/`, { resposta });
            if (res.data.success) {
                setStep('form');
            }
        } catch (err) {
            setError(err.response?.data?.error || "Resposta incorreta. Tente 'Jesus'.");
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

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Chamada para a nova Rota Direta de Auto-Cadastro
            const res = await axios.post(`${BASE_HOST}/portal/auto-cadastro/`, {
                ...formData,
                sync_resposta: resposta
            });
            if (res.data.success) {
                setStep('success');
            }
        } catch (err) {
            setError("Erro ao salvar cadastro. Verifique os campos ou se o CPF está correto.");
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
                    
                    <div className="w-full space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{config.pergunta}</label>
                        <input 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-blue-900 transition-all text-center uppercase"
                            value={resposta}
                            onChange={e => setResposta(e.target.value)}
                            placeholder="Sua resposta aqui..."
                            required
                            autoFocus
                        />
                        {error && <p className="text-rose-500 text-xs font-bold text-center mt-2">{error}</p>}
                        
                        <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-all mt-4">
                            {loading ? 'Verificando...' : 'Entrar no Formulário'}
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
                    <p className="text-slate-500 text-sm font-medium leading-relaxed my-8">
                        Seu cadastro foi salvo com sucesso no banco de dados da AD Capital.
                    </p>
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
                
                <form onSubmit={handleSave} className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100">
                    <MembroFormFields 
                        formData={formData}
                        handleChange={handleChange}
                        funcoes={funcoes}
                        aplicarMascaraTelefone={aplicarMascaraTelefone}
                        isPublic={true}
                    />
                    
                    {error && <p className="text-rose-500 text-xs font-bold text-center mt-6">{error} - Tente novamente em alguns minutos.</p>}
                    
                    <div className="mt-12 flex flex-col md:flex-row gap-4">
                        <button type="button" onClick={() => window.location.reload()} className="order-2 md:order-1 flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="order-1 md:order-2 flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 text-sm">
                            {loading ? 'Enviando...' : 'Finalizar Cadastro ✅'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
