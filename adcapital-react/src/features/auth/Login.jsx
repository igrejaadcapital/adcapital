import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import CpfInput from '../../shared/components/CpfInput';
import configuracaoService from '../../api/configuracaoService';

export default function Login({ isWakingUp }) {
  const { login, carregando, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Reset de Senha
  const [showReset, setShowReset] = useState(false);
  const [resetCpf, setResetCpf] = useState('');
  const [carregandoReset, setCarregandoReset] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username, password);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!resetCpf) return;
    setCarregandoReset(true);
    setResetMessage(null);
    try {
      const res = await configuracaoService.resetarSenha(resetCpf);
      setResetMessage({ type: 'success', text: res.data.success });
      setResetCpf('');
    } catch (err) {
      setResetMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao resetar senha.' });
    } finally {
      setCarregandoReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 safe-area-pt safe-area-pb">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Logo AD Capital" className="h-16 w-auto mb-4 object-contain rounded-sm" />
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Igreja AD Capital</h1>
          <p className="text-sm text-slate-500 font-medium">Acesso Restrito do Sistema</p>
          
          {isWakingUp && (
            <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 animate-pulse">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">Servidor iniciando...</span>
            </div>
          )}
        </div>

        {!showReset ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-semibold text-center border border-rose-100">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">
                Usuário (CPF)
              </label>
              <CpfInput
                required
                value={username}
                onChange={setUsername}
                placeholder="Digite seu CPF..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">
                Senha Pastoral
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="Digite sua senha..."
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {carregando ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Entrar no Sistema'
              )}
            </button>

            <button 
              type="button" 
              onClick={() => setShowReset(true)}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              Esqueci minha senha
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <h2 className="text-center font-black text-slate-700 uppercase tracking-widest text-sm">Recuperar Acesso</h2>
            
            {resetMessage && (
              <div className={`p-4 rounded-2xl text-sm font-semibold text-center border ${
                resetMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                {resetMessage.text}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">
                Informe seu CPF
              </label>
              <CpfInput
                required
                value={resetCpf}
                onChange={setResetCpf}
              />
            </div>

            <button
              type="submit"
              disabled={carregandoReset}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-4 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {carregandoReset ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Resetar Senha'
              )}
            </button>

            <button 
              type="button" 
              onClick={() => { setShowReset(false); setResetMessage(null); }}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
            >
              Voltar para o Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
