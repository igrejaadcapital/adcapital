import React, { useState, useEffect } from 'react';
import configuracaoService from '../../api/configuracaoService';

export default function SettingsPage() {
  const [funcoes, setFuncoes] = useState([]);
  const [categoriasEntrada, setCategoriasEntrada] = useState([]);
  const [categoriasSaida, setCategoriasSaida] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portalConfig, setPortalConfig] = useState({ is_ativo: true, pergunta: '', resposta: '' });

  const [novaFuncao, setNovaFuncao] = useState('');
  const [novaEntrada, setNovaEntrada] = useState('');
  const [novaSaida, setNovaSaida] = useState('');

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [fRes, cRes, pRes] = await Promise.all([
        configuracaoService.listarFuncoes(),
        configuracaoService.listarCategorias(),
        configuracaoService.getPortalConfig(),
      ]);
      
      setFuncoes(fRes.data);
      setCategoriasEntrada(cRes.data.filter(c => c.tipo === 'ENTRADA'));
      setCategoriasSaida(cRes.data.filter(c => c.tipo === 'SAIDA'));
      setPortalConfig(pRes.data);
    } catch (err) {
      console.error("Erro ao carregar configurações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleUpdatePortal = async (field, value) => {
    const updated = { ...portalConfig, [field]: value };
    setPortalConfig(updated);
    await configuracaoService.updatePortalConfig(updated);
  };

  const handleAdicionarFuncao = async () => {
    if (!novaFuncao) return;
    await configuracaoService.salvarFuncao({ nome: novaFuncao });
    setNovaFuncao('');
    carregarDados();
  };

  const handleAdicionarCategoria = async (tipo) => {
    const nome = tipo === 'ENTRADA' ? novaEntrada : novaSaida;
    if (!nome) return;
    await configuracaoService.salvarCategoria({ nome, tipo });
    if (tipo === 'ENTRADA') setNovaEntrada('');
    else setNovaSaida('');
    carregarDados();
  };

  const handleExcluirFuncao = async (id, nome) => {
    if (window.confirm(`Excluir cargo "${nome}"?`)) {
      await configuracaoService.excluirFuncao(id);
      carregarDados();
    }
  };

  const handleExcluirCategoria = async (id, nome) => {
    if (window.confirm(`Excluir categoria "${nome}"?`)) {
      await configuracaoService.excluirCategoria(id);
      carregarDados();
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-slate-400">Carregando configurações...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="px-4">
        <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Configurações do Sistema</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Gerenciamento de listas dinâmicas e parâmetros</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {/* Gestão de Cargos */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-slate-50 p-6 border-b border-slate-100">
             <h2 className="font-black text-blue-900 uppercase text-xs tracking-widest flex items-center gap-2">
               🎭 Cargos Ministeriais
             </h2>
          </div>
          <div className="p-4 bg-white border-b border-slate-100">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Novo cargo..." 
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                value={novaFuncao}
                onChange={e => setNovaFuncao(e.target.value)}
              />
              <button onClick={handleAdicionarFuncao} className="bg-blue-600 text-white px-3 rounded-lg font-black">+</button>
            </div>
          </div>
          <div className="p-4 space-y-2 flex-1 max-h-[400px] overflow-y-auto">
            {funcoes.map(f => (
              <div key={f.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                <span className="font-bold text-blue-900 text-sm">{f.nome}</span>
                <button onClick={() => handleExcluirFuncao(f.id, f.nome)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all">🗑️</button>
              </div>
            ))}
          </div>
        </section>

        {/* Gestão de Categorias de Depósito */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-emerald-50 p-6 border-b border-emerald-100">
             <h2 className="font-black text-emerald-900 uppercase text-xs tracking-widest flex items-center gap-2">
               💰 Categorias de Depósito
             </h2>
          </div>
          <div className="p-4 bg-white border-b border-slate-100">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nova categoria..." 
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                value={novaEntrada}
                onChange={e => setNovaEntrada(e.target.value)}
              />
              <button onClick={handleAdicionarCategoria('ENTRADA')} className="bg-emerald-600 text-white px-3 rounded-lg font-black">+</button>
            </div>
          </div>
          <div className="p-4 space-y-2 flex-1 max-h-[400px] overflow-y-auto">
             {categoriasEntrada.map(c => (
              <div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                <span className="font-bold text-slate-700 text-sm">{c.nome}</span>
                <button onClick={() => handleExcluirCategoria(c.id, c.nome)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all">🗑️</button>
              </div>
            ))}
          </div>
        </section>

        {/* Gestão de Categorias de Saque */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-rose-50 p-6 border-b border-rose-100">
             <h2 className="font-black text-rose-900 uppercase text-xs tracking-widest flex items-center gap-2">
               💸 Categorias de Saque
             </h2>
          </div>
          <div className="p-4 bg-white border-b border-slate-100">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nova categoria..." 
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500"
                value={novaSaida}
                onChange={e => setNovaSaida(e.target.value)}
              />
              <button onClick={handleAdicionarCategoria('SAIDA')} className="bg-rose-600 text-white px-3 rounded-lg font-black">+</button>
            </div>
          </div>
          <div className="p-4 space-y-2 flex-1 max-h-[400px] overflow-y-auto">
             {categoriasSaida.map(c => (
              <div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                <span className="font-bold text-slate-700 text-sm">{c.nome}</span>
                <button onClick={() => handleExcluirCategoria(c.id, c.nome)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all">🗑️</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* NOVO: Gestão do Portal de Auto-Cadastro */}
      <div className="px-4">
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-blue-600 p-6 flex justify-between items-center">
            <div>
              <h2 className="font-black text-white uppercase text-xs tracking-widest flex items-center gap-2">
                🌐 Portal de Auto-Cadastro de Membros
              </h2>
              <p className="text-blue-100 text-[10px] font-bold uppercase mt-1">Acesso externo para membros (URL: /cadastro)</p>
            </div>
            <button 
              onClick={() => handleUpdatePortal('is_ativo', !portalConfig.is_ativo)}
              className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${portalConfig.is_ativo ? 'bg-white text-blue-600' : 'bg-blue-800 text-blue-400'}`}
            >
              Link do Portal: {portalConfig.is_ativo ? '✅ Ativado' : '❌ Desativado'}
            </button>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-4">
               <div className="flex flex-col">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Pergunta de Segurança (O que o membro verá)</label>
                  <input 
                    type="text"
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                    value={portalConfig.pergunta}
                    onChange={e => setPortalConfig({...portalConfig, pergunta: e.target.value})}
                    onBlur={e => handleUpdatePortal('pergunta', e.target.value)}
                  />
               </div>
               <div className="flex flex-col">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Resposta Correta (Para liberar o formulário)</label>
                  <input 
                    type="text"
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600 uppercase"
                    value={portalConfig.resposta}
                    onChange={e => setPortalConfig({...portalConfig, resposta: e.target.value})}
                    onBlur={e => handleUpdatePortal('resposta', e.target.value)}
                  />
               </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
               <h4 className="text-[11px] font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                 ⚡ Resumo do Funcionamento
               </h4>
               <ul className="text-xs font-medium text-slate-600 space-y-3">
                 <li className="flex items-start gap-2">
                   <span className="text-blue-500">→</span>
                   <span>Membros acessarão a URL <span className="font-bold text-blue-600">/cadastro</span>.</span>
                 </li>
                 <li className="flex items-start gap-2">
                   <span className="text-blue-500">→</span>
                   <span>Eles devem responder a pergunta corretamente para ver o formulário.</span>
                 </li>
                 <li className="flex items-start gap-2">
                   <span className="text-blue-500">→</span>
                   <span>O sistema identifica membros existentes pelo CPF para permitir atualizações.</span>
                 </li>
               </ul>
            </div>
          </div>
        </section>
      </div>

      <div className="px-4">
        <div className="bg-blue-900 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Dica de Gestão</h3>
              <p className="text-blue-200 text-sm font-medium mt-1">Todas as listas e configurações definidas aqui são aplicadas globalmente em todo o sistema.</p>
          </div>
          <div className="flex gap-4">
              <span className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Sincronizado via Banco de Dados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
