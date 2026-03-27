import React, { useState } from 'react';
import { useAuth } from './useAuth';

export default function Login() {
  const { login, carregando, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sucesso = await login(username, password);
    if (sucesso) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Logo AD Capital" className="h-16 w-auto mb-4 object-contain rounded-sm" />
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Igreja AD Capital</h1>
          <p className="text-sm text-slate-500 font-medium">Acesso Restrito do Sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-semibold text-center border border-rose-100">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">
              Usuário
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="Digite seu usuário..."
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
              placeholder="Digite sua senha secreta..."
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {carregando ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
