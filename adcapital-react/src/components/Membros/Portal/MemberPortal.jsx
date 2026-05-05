import React, { useState, useEffect } from 'react';
import api from '../../../api/config';
import StatusView from '../../Common/StatusView';

export default function MemberPortal() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({});
  const [mensagem, setMensagem] = useState(null);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await api.get('/membros/meus-dados/');
      setDados(res.data);
      setFormData(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao carregar dados.';
      setMensagem({ type: 'error', text: msg });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/membros/meus-dados/', formData);
      setMensagem({ type: 'success', text: 'Dados atualizados com sucesso!' });
      setEditando(false);
      carregarDados();
    } catch (err) {
      setMensagem({ type: 'error', text: 'Erro ao atualizar dados.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dados) return <StatusView loading={true} />;
  if (!dados) return (
    <div className="p-8 text-center space-y-4">
      <div className="text-slate-400 font-bold">Nenhum dado de membro vinculado a este usuário.</div>
      {mensagem && (
        <div className="text-xs text-rose-500 bg-rose-50 p-3 rounded-xl inline-block border border-rose-100">
          Detalhe: {mensagem.text}
        </div>
      )}
      <button onClick={() => window.location.reload()} className="block mx-auto text-xs font-black text-blue-600 uppercase">Tentar Novamente</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-blue-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <h1 className="text-3xl font-black italic">Olá, {dados.nome.split(' ')[0]}! 👋</h1>
        <p className="text-blue-200">Bem-vindo ao seu portal de membro.</p>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-2xl text-sm font-bold ${mensagem.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
          {mensagem.text}
        </div>
      )}

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">📋 Meus Dados Cadastrais</h3>
          {!editando && (
            <button onClick={() => setEditando(true)} className="text-xs font-black text-blue-600 uppercase">Editar Dados</button>
          )}
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
            <input 
              type="email" 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.email || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.telefone || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, telefone: e.target.value})}
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logradouro</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.logradouro || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, logradouro: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.bairro || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, bairro: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cidade</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.cidade || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, cidade: e.target.value})}
            />
          </div>

          {editando && (
            <div className="md:col-span-2 flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-blue-900 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Salvar Alterações</button>
              <button type="button" onClick={() => setEditando(false)} className="flex-1 bg-slate-100 text-slate-400 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Cancelar</button>
            </div>
          )}
        </form>
      </div>

      <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between">
        <div>
          <h4 className="font-black text-emerald-800 tracking-tight">Status de Membro</h4>
          <p className="text-emerald-600 text-sm font-medium">{dados.status === 'LIGADO' ? '✅ Você está com cadastro ativo e regular.' : '⚠️ Cadastro em revisão.'}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm text-emerald-700 font-black text-xs uppercase tracking-widest">
          {dados.funcao || 'Membro'}
        </div>
      </div>
    </div>
  );
}
