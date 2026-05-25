import React, { useState, useEffect } from 'react';
import api from '../../../api/config';
import StatusView from '../../Common/StatusView';
import configuracaoService from '../../../api/configuracaoService';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, Camera, UserPlus, Trash2 } from 'lucide-react';
import MemberAgenda from './MemberAgenda';
import ParentescoFormPublico from '../ParentescoFormPublico';
import { trackPageView } from '../../../hooks/useAnalytics';
import { trackInternalAcesso } from '../../../api/internalAnalytics';

export default function MemberPortal({ abaAtiva = 'mensagens' }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({});
  const [mensagem, setMensagem] = useState(null);
  const [opcoesFuncao, setOpcoesFuncao] = useState([]);
  const [devocionais, setDevocionais] = useState([]);
  const [devocionalExpandida, setDevocionalExpandida] = useState(null);

  
  // Parentesco e Senha
  const [graus, setGraus] = useState([]);
  const [novaSenha, setNovaSenha] = useState('');
  const [carregandoSenha, setCarregandoSenha] = useState(false);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [res, resFuncoes, resDevocionais, resGraus] = await Promise.all([
        api.get('/membros/meus-dados/'),
        api.get('/opcoes-funcao/'),
        api.get('/devocionais/'),
        api.get('/opcoes-parentesco/')
      ]);
      setDados(res.data);
      // Prepara o formData com os parentescos atuais mapeados para o formato de edição
      const parentesAtuais = res.data.parentes?.map(p => ({
        parente_id: p.membro_destino,
        grau: p.grau,
        busca_termo: p.nome_parente
      })) || [];
      
      setFormData({ ...res.data, parentescos_novo: parentesAtuais });
      setOpcoesFuncao(resFuncoes.data);
      setDevocionais(resDevocionais.data);
      setGraus(resGraus.data);
      
      if (resDevocionais.data.length > 0) {
        setDevocionalExpandida(resDevocionais.data[0].id);
      }
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
    trackInternalAcesso('PORTAL');
  }, []);

  useEffect(() => {
    const portalPages = {
      mensagens: { path: '/portal/mensagens', title: 'AD Capital - Portal do Membro (Mensagens)' },
      agenda: { path: '/portal/agenda', title: 'AD Capital - Portal do Membro (Agenda)' },
      perfil: { path: '/portal/perfil', title: 'AD Capital - Portal do Membro (Meu Perfil)' }
    };

    const currentPage = portalPages[abaAtiva];
    if (currentPage) {
      trackPageView(currentPage.path, currentPage.title);
    }
  }, [abaAtiva]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      
      // Lista de campos permitidos para edição pelo próprio membro
      const camposPermitidos = [
        'telefone', 'email', 'logradouro', 'numero', 'complemento', 'bairro', 
        'cidade', 'uf', 'cep', 'data_nascimento', 'genero', 'estado_civil', 
        'naturalidade', 'data_entrada', 'unidade', 'departamento', 
        'motivo_entrada', 'observacoes', 'funcao'
      ];

      camposPermitidos.forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      // Foto (apenas se for um novo arquivo)
      if (formData.foto instanceof File) {
        data.append('foto', formData.foto);
      }

      // Parentescos
      if (formData.parentescos_novo) {
        data.append('parentescos_novo', JSON.stringify(formData.parentescos_novo));
      }

      await api.patch('/membros/meus-dados/', data);
      setMensagem({ type: 'success', text: 'Dados atualizados com sucesso!' });
      setEditando(false);
      carregarDados();
    } catch (err) {
      setMensagem({ type: 'error', text: 'Erro ao atualizar dados.' });
    } finally {
      setLoading(false);
    }
  };

  const atualizarParentesco = (index, campo, valor) => {
    setFormData(prev => {
        const novos = [...(prev.parentescos_novo || [])];
        novos[index][campo] = valor;
        return { ...prev, parentescos_novo: novos };
    });
  };

  const adicionarParentesco = () => {
    setFormData(prev => ({
        ...prev,
        parentescos_novo: [...(prev.parentescos_novo || []), { parente_id: null, grau: '', busca_termo: '' }]
    }));
  };

  const removerParentesco = (index) => {
    setFormData(prev => {
        const novos = [...(prev.parentescos_novo || [])];
        novos.splice(index, 1);
        return { ...prev, parentescos_novo: novos };
    });
  };

  const handleTrocarSenha = async (e) => {
    e.preventDefault();
    if (!novaSenha || novaSenha.length < 4) {
      setMensagem({ type: 'error', text: 'A senha deve ter pelo menos 4 caracteres.' });
      return;
    }
    setCarregandoSenha(true);
    try {
      await configuracaoService.trocarSenha(novaSenha);
      setMensagem({ type: 'success', text: 'Senha alterada com sucesso!' });
      setNovaSenha('');
    } catch (err) {
      setMensagem({ type: 'error', text: 'Erro ao trocar senha.' });
    } finally {
      setCarregandoSenha(false);
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
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-blue-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <h1 className="text-3xl font-black italic">Olá, {dados.nome}! 👋</h1>
        <p className="text-blue-200">Bem-vindo ao seu portal de membro.</p>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-2xl text-sm font-bold ${mensagem.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
          {mensagem.text}
        </div>
      )}

      {abaAtiva === 'mensagens' && (
        <div className="space-y-8">
          {/* Seção de Devocionais / Mensagens do Pastor */}
          {devocionais.length > 0 ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">

          <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2"><BookOpen size={16} className="text-blue-600"/> Histórico de Devocionais</h3>
            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">{devocionais.length} Mensagens</span>
          </div>
          <div className="divide-y divide-slate-100">
            {devocionais.slice(0, 30).map(d => {
              const isExpanded = devocionalExpandida === d.id;
              return (
                <div key={d.id} className="transition-colors hover:bg-slate-50/50">
                  <button 
                    onClick={() => setDevocionalExpandida(isExpanded ? null : d.id)}
                    className="w-full text-left p-6 md:p-8 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-widest">{new Date(d.data_publicacao).toLocaleDateString('pt-BR')}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Por: {d.autor}</span>
                      </div>
                      <h4 className={`text-lg md:text-xl font-black leading-tight transition-colors ${isExpanded ? 'text-blue-600' : 'text-slate-900'}`}>{d.titulo}</h4>
                    </div>
                    <div className={`p-2 rounded-full transition-all ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                        <ChevronDown size={20} />
                      </motion.div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 md:p-8 pt-0 text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap border-t border-slate-50 mt-2 bg-slate-50/30">
                          {d.conteudo}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
          ) : (
            <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
              <p className="text-slate-400 font-bold">Nenhuma mensagem disponível no momento.</p>
            </div>
          )}
        </div>
      )}

      {abaAtiva === 'agenda' && (
        <MemberAgenda />
      )}

      {abaAtiva === 'perfil' && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 overflow-hidden">
            <div className="flex justify-between items-center">

          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">📋 Meus Dados Cadastrais</h3>
          {!editando && (
            <button onClick={() => setEditando(true)} className="text-xs font-black text-blue-600 uppercase">Editar Dados</button>
          )}
        </div>

        {/* Upload de Foto */}
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-200">
              {formData.foto ? (
                <img 
                  src={formData.foto instanceof File ? URL.createObjectURL(formData.foto) : formData.foto} 
                  alt="Perfil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Camera size={40} />
                </div>
              )}
            </div>
            {editando && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-all group-hover:scale-110">
                <Camera size={16} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={e => setFormData({ ...formData, foto: e.target.files[0] })}
                />
              </label>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-xl font-black text-slate-800">{dados.nome}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{dados.funcao || 'Membro'}</p>
            {editando && <p className="text-[10px] text-blue-600 font-bold mt-2 uppercase">Clique no ícone da câmera para trocar sua foto</p>}
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ... (campos existentes mantidos) ... */}
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

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Nascimento</label>
            <input 
              type="date" 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.data_nascimento || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, data_nascimento: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gênero</label>
            <select 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.genero || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, genero: e.target.value})}
            >
              <option value="M">Varão</option>
              <option value="F">Varoa</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado Civil</label>
            <select 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.estado_civil || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, estado_civil: e.target.value})}
            >
              <option value="SOLTEIRO">Solteiro(a)</option>
              <option value="CASADO">Casado(a)</option>
              <option value="DIVORCIADO">Divorciado(a)</option>
              <option value="VIUVO">Viúvo(a)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Naturalidade (UF)</label>
            <input 
              type="text" 
              maxLength="2"
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.naturalidade || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, naturalidade: e.target.value.toUpperCase()})}
            />
          </div>

          {/* Dados Eclesiásticos */}
          <div className="md:col-span-2 pt-4 border-t border-slate-50">
            <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Informações Eclesiásticas</h4>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Função na Igreja</label>
            <select 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.funcao || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, funcao: e.target.value})}
            >
              <option value="">Selecione...</option>
              {opcoesFuncao.map(f => (
                <option key={f.id} value={f.nome}>{f.nome}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Entrada</label>
            <input 
              type="date" 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.data_entrada || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, data_entrada: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unidade</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.unidade || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, unidade: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departamento</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.departamento || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, departamento: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivo da Entrada</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.motivo_entrada || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, motivo_entrada: e.target.value})}
            />
          </div>

          {/* Endereço */}
          <div className="md:col-span-2 pt-4 border-t border-slate-50">
            <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Endereço Residencial</h4>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CEP</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.cep || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, cep: e.target.value})}
            />
          </div>

          <div className="space-y-1">
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.numero || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, numero: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Complemento</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={formData.complemento || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, complemento: e.target.value})}
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cidade / UF</label>
            <div className="grid grid-cols-4 gap-2">
               <input 
                type="text" 
                placeholder="Cidade"
                className="col-span-3 w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
                value={formData.cidade || ''} 
                disabled={!editando}
                onChange={e => setFormData({...formData, cidade: e.target.value})}
              />
              <input 
                type="text" 
                maxLength="2"
                placeholder="UF"
                className="col-span-1 w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10 text-center" 
                value={formData.uf || ''} 
                disabled={!editando}
                onChange={e => setFormData({...formData, uf: e.target.value.toUpperCase()})}
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações</label>
            <textarea 
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[80px]" 
              value={formData.observacoes || ''} 
              disabled={!editando}
              onChange={e => setFormData({...formData, observacoes: e.target.value})}
            />
          </div>

          {editando && (
            <div className="md:col-span-2 flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-blue-900 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Salvar Alterações</button>
              <button type="button" onClick={() => { setEditando(false); setFormData(dados); }} className="flex-1 bg-slate-100 text-slate-400 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Cancelar</button>
            </div>
          )}
        </form>
      </div>

      {/* Alterar Senha */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-6">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">🔐 Segurança e Acesso</h3>
        <form onSubmit={handleTrocarSenha} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-1 w-full">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nova Senha</label>
            <input 
              type="password" 
              placeholder="Digite sua nova senha..."
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl font-bold text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
              value={novaSenha} 
              onChange={e => setNovaSenha(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={carregandoSenha}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {carregandoSenha ? 'Atualizando...' : 'Atualizar Senha'}
          </button>
        </form>
        <p className="text-[10px] text-slate-500 font-medium italic">Sua senha é pessoal e intransferível. Recomendamos o uso de pelo menos 6 caracteres.</p>
      </div>

      {/* Vínculos Familiares */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
        {editando ? (
          <ParentescoFormPublico 
            formData={formData}
            graus={graus}
            atualizarParentesco={atualizarParentesco}
            adicionarParentesco={adicionarParentesco}
            removerParentesco={removerParentesco}
          />
        ) : (
          <>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">👨‍👩‍👧‍👦 Vínculos Familiares</h3>
            {dados.parentes && dados.parentes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dados.parentes.map(parente => (
                  <div key={parente.id} className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100/50">
                    <span className="font-bold text-slate-700 text-sm">{parente.nome_parente}</span>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">
                      {graus.find(g => g.id === parente.grau)?.nome || parente.grau}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-bold italic">Nenhum vínculo familiar cadastrado. Clique em "Editar Dados" para adicionar.</p>
            )}
          </>
        )}
      </div>

      <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between">
        <div>
          <h4 className="font-black text-emerald-800 tracking-tight">Status de Membro</h4>
          <p className="text-emerald-600 text-sm font-medium">{dados.status === 'LIGADO' ? '✅ Você está com cadastro ativo e regular.' : '⚠️ Cadastro em revisão.'}</p>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}
