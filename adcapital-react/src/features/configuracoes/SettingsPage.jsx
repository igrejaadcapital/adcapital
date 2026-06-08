import React, { useState, useEffect } from 'react';
import configuracaoService from '../../api/configuracaoService';
import api from '../../api/config';
import { 
  Globe, 
  ImageIcon, 
  Calendar, 
  Trash2, 
  Plus, 
  BookOpen,
  Info,
  Settings,
  ShieldAlert,
  Loader2,
  MessageSquare
} from 'lucide-react';
import StatusView from '../../shared/components/StatusView';
import { cn, Field, SettingsBox } from './settings/settingsUi';
import SettingsWikiTab from './settings/SettingsWikiTab';
import SettingsDevocionaisTab from './settings/SettingsDevocionaisTab';

export default function SettingsPage() {
  const [aba, setAba] = useState('geral');
  const [funcoes, setFuncoes] = useState([]);
  const [categoriasEntrada, setCategoriasEntrada] = useState([]);
  const [categoriasSaida, setCategoriasSaida] = useState([]);
  const [portalConfig, setPortalConfig] = useState({ is_ativo: true, pergunta: '', resposta: '' });
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Estados Site
  const [siteConfig, setSiteConfig] = useState({
    instagram_url: '',
    youtube_url: '',
    google_maps_url: '',
    pix_chave: '',
    banco_nome: '',
    beneficiario: '',
    pastoral_titulo: '',
    pastoral_texto: '',
    pastor_nome: '',
    pastor_foto: null
  });
  const [programacao, setProgramacao] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [novaProg, setNovaProg] = useState({ dia_semana: 0, titulo: '', horario: '', ordem: 0 });
  const [comentarios, setComentarios] = useState([]);
  const [devocionais, setDevocionais] = useState([]);
  const [novaDevocional, setNovaDevocional] = useState({ titulo: '', conteudo: '', autor: 'Pastor', is_ativo: true });
  const [deletandoId, setDeletandoId] = useState(null);
  const [, setSucesso] = useState(false);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(false);
      const [fRes, cRes, pRes, sRes, gRes, pgRes, uRes, comRes, devRes] = await Promise.all([
        configuracaoService.listarFuncoes(),
        configuracaoService.listarCategorias(),
        configuracaoService.getPortalConfig(),
        configuracaoService.getSiteConfig(),
        configuracaoService.getGaleria(),
        configuracaoService.getProgramacao(),
        configuracaoService.listarUsuarios().catch(() => ({ data: [] })), // Fallback if not admin
        api.get('/comentarios/').catch(() => ({ data: [] })),
        api.get('/devocionais/').catch(() => ({ data: [] }))
      ]);
      
      setFuncoes(fRes.data);
      setCategoriasEntrada(cRes.data.filter(c => c.tipo === 'ENTRADA'));
      setCategoriasSaida(cRes.data.filter(c => c.tipo === 'SAIDA'));
      setPortalConfig(pRes.data);
      setSiteConfig(sRes.data);
      setProgramacao(pgRes.data);
      setGaleria(gRes.data);
      setUsuarios(uRes.data);
      setComentarios(comRes.data);
      setDevocionais(devRes.data || []);
    } catch (err) {
      console.error("Erro ao carregar configurações:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const salvarSite = async () => {
    setLoading(true);
    const formData = new FormData();
    Object.keys(siteConfig).forEach(key => {
      const value = siteConfig[key];
      
      // Regra para Foto: Só envia se for um arquivo novo (objeto File)
      if (key === 'pastor_foto') {
        if (value instanceof File) {
          formData.append(key, value);
        }
      } 
      // Regra para outros campos: Só envia se não for nulo/undefined
      // Isso evita enviar a string "null" para o backend
      else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    try {
      await configuracaoService.saveSiteConfig(formData);
      alert("Configurações do site salvas!");
      await carregarDados();
    } catch(e) { 
      console.error("Erro ao salvar site:", e.response?.data || e);
      alert("Erro ao salvar: " + JSON.stringify(e.response?.data || "Verifique os dados."));
    }
    setLoading(false);
  };

  const salvarSeguranca = async () => {
    setLoading(true);
    try {
      await configuracaoService.savePortalConfig(portalConfig);
      alert("Segurança do Portal atualizada!");
      await carregarDados();
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const handleMudarPapel = async (userId, newRole) => {
    try {
      setLoading(true);
      await configuracaoService.atualizarPapelUsuario(userId, newRole);
      await carregarDados();
    } catch (err) {
      console.error("Erro ao mudar papel:", err);
      alert("Erro ao alterar acesso.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelFoto = async (id) => {
    if (confirm('Excluir esta foto da galeria?')) {
      setDeletandoId(id);
      try {
        await configuracaoService.excluirFotoGaleria(id);
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
        await carregarDados();
      } catch (err) {
        console.error(err);
      } finally {
        setDeletandoId(null);
      }
    }
  };

  const handleAddFoto = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setLoading(true);
    let sucessos = 0;
    
    try {
      // Faz o upload de cada arquivo individualmente para o Cloudinary via Backend
      for (const file of files) {
        const formData = new FormData();
        formData.append('imagem', file);
        formData.append('legenda', `Foto da Igreja - ${new Date().toLocaleDateString()}`);
        
        await configuracaoService.uploadFotoGaleria(formData);
        sucessos++;
      }
      
      if (sucessos > 0) {
        alert(`${sucessos} foto(s) carregada(s) com sucesso na galeria!`);
      }
    } catch (err) {
      console.error("Erro no upload:", err);
      alert("Houve um problema ao carregar uma ou mais fotos. Verifique o tamanho do arquivo ou sua conexão.");
    } finally {
      await carregarDados(); // Recarrega para exibir as novas fotos
      setLoading(false);
      // Limpa o valor do input para permitir selecionar os mesmos arquivos de novo se desejar
      e.target.value = '';
    }
  };

  const handleSalvarProg = async () => {
    if (!novaProg.titulo || !novaProg.horario) return alert("Preencha o título e o horário.");
    await configuracaoService.saveProgramacao(novaProg);
    setNovaProg({ dia_semana: 0, titulo: '', horario: '', ordem: 0 });
    carregarDados();
  };

  const handleDelProg = async (id) => {
    if (confirm('Excluir este horário?')) {
      setDeletandoId(id); // Reusa o estado de deletandoId para Programação também
      try {
        await configuracaoService.deleteProgramacao(id);
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
        await carregarDados();
      } catch (err) {
        console.error(err);
      } finally {
        setDeletandoId(null);
      }
    }
  };

  const handleDelComentario = async (id) => {
    if (confirm('Excluir este comentário do site público?')) {
      setDeletandoId(`com_${id}`);
      try {
        await api.delete(`/comentarios/${id}/`);
        setComentarios(comentarios.filter(c => c.id !== id));
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir comentário.');
      } finally {
        setDeletandoId(null);
      }
    }
  };

  const handleSalvarDevocional = async () => {
    if (!novaDevocional.titulo || !novaDevocional.conteudo) return alert("Preencha título e conteúdo.");
    try {
      setLoading(true);
      await api.post('/devocionais/', novaDevocional);
      setNovaDevocional({ titulo: '', conteudo: '', autor: 'Pastor', is_ativo: true });
      await carregarDados();
      alert("Devocional publicada!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar devocional.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelDevocional = async (id) => {
    if (confirm('Excluir esta devocional?')) {
      try {
        await api.delete(`/devocionais/${id}/`);
        await carregarDados();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[80vh] p-4 text-slate-800 relative">
      <StatusView 
        loading={loading && !siteConfig.pastor_nome} 
        error={error} 
        onRetry={carregarDados} 
        message="Falha nas Configurações"
        subMessage="O servidor pode estar em Cold Start. Tente reconectar para carregar as opções administrativas."
      />
      
      <aside className="w-full md:w-64 space-y-2">
        <button onClick={() => setAba('geral')} className={cn("w-full p-4 rounded-3xl flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest", aba === 'geral' ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50")}>
          <Settings size={18} /> Gerais
        </button>
        <button onClick={() => setAba('site')} className={cn("w-full p-4 rounded-3xl flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest", aba === 'site' ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50")}>
          <Globe size={18} /> Site Público
        </button>
        <button onClick={() => setAba('programacao')} className={cn("w-full p-4 rounded-3xl flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest", aba === 'programacao' ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50")}>
          <Calendar size={18} /> Programação
        </button>
        <button onClick={() => setAba('galeria')} className={cn("w-full p-4 rounded-3xl flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest", aba === 'galeria' ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50")}>
          <ImageIcon size={18} /> Galeria
        </button>
        <button onClick={() => setAba('devocionais')} className={cn("w-full p-4 rounded-3xl flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest", aba === 'devocionais' ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50")}>
          <MessageSquare size={18} /> Devocionais
        </button>
        <button onClick={() => setAba('seguranca')} className={cn("w-full p-4 rounded-3xl flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest", aba === 'seguranca' ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50")}>
          <ShieldAlert size={18} /> Segurança
        </button>
        <button onClick={() => setAba('wiki')} className={cn("w-full p-4 rounded-3xl flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest", aba === 'wiki' ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50")}>
          <BookOpen size={18} /> Wiki & TI
        </button>
      </aside>

      <div className="flex-1">
          {/* --- ABA GERAIS --- */}
          {aba === 'geral' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SettingsBox 
                title="Funções" 
                color="blue" 
                data={funcoes} 
                onAdd={v => configuracaoService.adicionarFuncao(v)
                  .then(carregarDados)
                  .catch(err => alert(err.response?.data?.error || "Erro ao salvar função."))}
                onDelete={id => configuracaoService.excluirFuncao(id).then(carregarDados)} 
              />
              <SettingsBox 
                title="Categorias (+)" 
                color="emerald" 
                data={categoriasEntrada} 
                onAdd={v => configuracaoService.adicionarCategoria({nome: v, tipo: 'ENTRADA'})
                  .then(carregarDados)
                  .catch(err => alert(err.response?.data?.error || "Erro ao salvar categoria."))}
                onDelete={id => configuracaoService.excluirCategoria(id).then(carregarDados)} 
              />
              <SettingsBox 
                title="Categorias (-)" 
                color="rose" 
                data={categoriasSaida} 
                onAdd={v => configuracaoService.adicionarCategoria({nome: v, tipo: 'SAIDA'})
                  .then(carregarDados)
                  .catch(err => alert(err.response?.data?.error || "Erro ao salvar categoria."))}
                onDelete={id => configuracaoService.excluirCategoria(id).then(carregarDados)} 
              />
            </div>
          )}

          {/* --- ABA SITE PÚBLICO --- */}
          {aba === 'site' && siteConfig && (
            <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
               <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h2 className="font-black uppercase text-xs tracking-widest">Configuração do Site</h2>
                  <button onClick={salvarSite} className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                    SALVAR
                  </button>
               </div>
               <div className="p-8 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <Field label="Instagram URL (Perfil)" value={siteConfig.instagram_url} onChange={v => setSiteConfig({...siteConfig, instagram_url: v})} />
                        <Field label="URL do Último Post do Instagram (Feed/Reel)" value={siteConfig.ultimo_post_instagram_url} onChange={v => setSiteConfig({...siteConfig, ultimo_post_instagram_url: v})} />
                        <Field label="Youtube URL" value={siteConfig.youtube_url} onChange={v => setSiteConfig({...siteConfig, youtube_url: v})} />
                        <Field label="Chave PIX (Dízimos)" value={siteConfig.pix_chave} onChange={v => setSiteConfig({...siteConfig, pix_chave: v})} />
                     </div>
                     <div className="space-y-6">
                        <Field label="Nome do Banco" value={siteConfig.banco_nome} onChange={v => setSiteConfig({...siteConfig, banco_nome: v})} />
                        <Field label="Pastor Responsável" value={siteConfig.pastor_nome} onChange={v => setSiteConfig({...siteConfig, pastor_nome: v})} />
                        <div className="flex flex-col">
                           <label className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Foto do Pastor</label>
                           <input type="file" accept=".jpg,.jpeg,.png,.webp,.JPG,.JPEG,.PNG" onChange={e => setSiteConfig({...siteConfig, pastor_foto: e.target.files[0]})} className="text-xs" />
                        </div>
                     </div>
                  </div>

                  {/* Agrupamento Pastoral Recomendado */}
                  <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100/50 space-y-6">
                      <h3 className="font-black text-blue-900/40 text-[10px] uppercase tracking-[0.2em] mb-2">Palavra do Pastor (Destaque no Site)</h3>
                      <Field label="Título Pastoral" value={siteConfig.pastoral_titulo} onChange={v => setSiteConfig({...siteConfig, pastoral_titulo: v})} />
                      <Field label="Mensagem Pastoral" isTextArea value={siteConfig.pastoral_texto} onChange={v => setSiteConfig({...siteConfig, pastoral_texto: v})} />
                  </div>

                  {/* Moderação de Comentários */}
                  <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                      <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                         <MessageSquare size={14} className="text-blue-500" />
                         Moderação de Comentários
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">Gerencie as mensagens deixadas na Palavra Pastoral</p>
                      
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {comentarios.length === 0 ? (
                           <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-[2rem]">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nenhum comentário ainda</p>
                           </div>
                        ) : (
                           comentarios.map(c => (
                             <div key={c.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 transition-colors gap-4">
                               <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                     <span className="font-black text-sm text-blue-600">{c.nome}</span>
                                     <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                       {new Date(c.criado_em).toLocaleDateString('pt-BR')}
                                     </span>
                                  </div>
                                  <p className="text-xs font-medium text-slate-600">{c.texto}</p>
                               </div>
                               <button 
                                 onClick={() => handleDelComentario(c.id)}
                                 disabled={deletandoId === `com_${c.id}`}
                                 className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors font-black text-[10px] uppercase tracking-widest shrink-0"
                               >
                                 {deletandoId === `com_${c.id}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                 Excluir
                               </button>
                             </div>
                           ))
                        )}
                      </div>
                  </div>
               </div>
            </section>
          )}

          {/* --- ABA PROGRAMAÇÃO --- */}
          {aba === 'programacao' && (
            <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
               <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="font-black uppercase text-xs tracking-widest text-slate-800">Programação Semanal</h2>
               </div>
               
               {/* Formulário de Inserção Restaurado */}
               <div className="p-8 bg-slate-50 border-b border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                     <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dia</label>
                        <select className="p-4 bg-white border border-slate-200 rounded-2xl font-bold text-xs"
                          value={novaProg.dia_semana} onChange={e => setNovaProg({...novaProg, dia_semana: parseInt(e.target.value)})}>
                          <option value="0">DOMINGO</option>
                          <option value="1">SEGUNDA</option>
                          <option value="2">TERÇA</option>
                          <option value="3">QUARTA</option>
                          <option value="4">QUINTA</option>
                          <option value="5">SEXTA</option>
                          <option value="6">SÁBADO</option>
                        </select>
                     </div>
                     <div className="md:col-span-1"><Field label="Título do Evento" value={novaProg.titulo} onChange={v => setNovaProg({...novaProg, titulo: v})} /></div>
                     <div className="md:col-span-1"><Field label="Horário" value={novaProg.horario} onChange={v => setNovaProg({...novaProg, horario: v})} /></div>
                     <button onClick={handleSalvarProg} className="bg-slate-900 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest">ADICIONAR</button>
                  </div>
               </div>

               <div className="p-8 space-y-4">
                  {programacao.sort((a,b) => a.dia_semana - b.dia_semana).map(p => (
                    <div key={p.id} className="flex justify-between items-center p-5 bg-white border border-slate-100 rounded-[1.5rem] hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 transition-all group">
                       <div>
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1 block">
                            {['DOMINGO','SEGUNDA','TERÇA','QUARTA','QUINTA','SEXTA','SÁBADO'][p.dia_semana]}
                          </span>
                          <p className="font-bold text-slate-800">{p.titulo}</p>
                          <p className="text-xs font-bold text-slate-400">{p.horario}</p>
                       </div>
                       <button 
                         onClick={() => handleDelProg(p.id)} 
                         disabled={deletandoId !== null}
                         className={cn("p-3 rounded-xl transition-all", 
                           deletandoId === p.id ? "text-blue-600 bg-blue-50" : "text-rose-500 opacity-20 group-hover:opacity-100 hover:bg-rose-50"
                         )}
                       >
                          {deletandoId === p.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                       </button>
                    </div>
                  ))}
               </div>
            </section>
          )}

          {/* --- ABA GALERIA --- */}
          {aba === 'galeria' && (
             <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8">
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h2 className="font-black uppercase text-xs tracking-widest text-slate-800">Galeria Institucional</h2>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Imagens exibidas no site público</p>
                   </div>
                   <label className="bg-blue-600 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3">
                      <Plus size={16} /> Carregar Fotos
                      <input type="file" className="hidden" multiple accept=".jpg,.jpeg,.png,.webp,.JPG,.JPEG,.PNG" onChange={handleAddFoto} />
                   </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                   {galeria.map(f => (
                     <div key={f.id} className="aspect-square bg-slate-50 rounded-[2rem] overflow-hidden relative group border border-slate-100">
                        <img src={f.imagem} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className={cn("absolute inset-0 transition-all flex flex-col items-center justify-center gap-2", 
                          deletandoId === f.id ? "bg-white/90 opacity-100" : "bg-rose-600/90 opacity-0 group-hover:opacity-100"
                        )}>
                           <button 
                             onClick={() => handleDelFoto(f.id)} 
                             disabled={deletandoId !== null}
                             className={cn("font-black text-xs uppercase tracking-widest flex items-center gap-2", 
                               deletandoId === f.id ? "text-blue-600" : "text-white"
                             )}
                           >
                              {deletandoId === f.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                              {deletandoId === f.id ? 'Excluindo...' : 'Excluir'}
                           </button>
                        </div>
                     </div>
                   ))}
                   {galeria.length === 0 && (
                     <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-bold uppercase tracking-widest text-xs">
                        Nenhuma foto na galeria
                     </div>
                   )}
                </div>
             </section>
          )}

          {/* --- ABA SEGURANÇA --- */}
          {aba === 'seguranca' && portalConfig && (
            <div className="space-y-8">
              {/* Configuração do Portal */}
              <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h2 className="font-black uppercase text-xs tracking-widest text-slate-800">Segurança do Portal de Cadastro</h2>
                    <button onClick={salvarSeguranca} className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                      SALVAR
                    </button>
                </div>
                <div className="p-8 space-y-10">
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-14 h-8 rounded-full relative cursor-pointer transition-all", portalConfig.is_ativo ? "bg-emerald-500" : "bg-slate-300")}
                            onClick={() => setPortalConfig({...portalConfig, is_ativo: !portalConfig.is_ativo})}>
                          <div className={cn("absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm", portalConfig.is_ativo ? "translate-x-6" : "translate-x-0")} />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800 uppercase tracking-widest">Portal Ativo</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Define se o auto-cadastro está aberto ao público</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="Pergunta de Acesso" value={portalConfig.pergunta} onChange={v => setPortalConfig({...portalConfig, pergunta: v})} />
                        <Field label="Resposta Correta (Senha)" value={portalConfig.resposta} onChange={v => setPortalConfig({...portalConfig, resposta: v})} />
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <Info className="text-blue-600 shrink-0" size={20} />
                      <div>
                        <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">Dica de Segurança</p>
                        <p className="text-[10px] text-blue-800/60 font-bold leading-relaxed">
                          A "Resposta Correta" funciona como uma senha compartilhada para sua igreja. Informe esta resposta aos membros que desejam se cadastrar. O sistema não diferencia maiúsculas de minúsculas.
                        </p>
                      </div>
                    </div>
                </div>
              </section>

              {/* Gestão de Usuários (RBAC) */}
              <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-black uppercase text-xs tracking-widest text-slate-800 flex items-center gap-2">
                       Gestão de Acessos e Usuários
                    </h2>
                </div>
                <div className="p-8">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="pb-4 px-2">Usuário</th>
                          <th className="pb-4 px-2 text-center">Nível de Acesso</th>
                          <th className="pb-4 px-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {usuarios.map(u => (
                          <tr key={u.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-2">
                              <p className="font-bold text-slate-800 text-sm">{u.nome?.split(' ')[0]}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{u.username}</p>
                            </td>
                            <td className="py-4 px-2 text-center">
                              <select 
                                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500"
                                value={u.role}
                                onChange={(e) => handleMudarPapel(u.id, e.target.value)}
                              >
                                <option value="ADMIN">ADMIN</option>
                                <option value="SECRETARIO">SECRETÁRIO</option>
                                <option value="TESOUREIRO">TESOUREIRO</option>
                                <option value="MEMBRO">MEMBRO</option>
                              </select>
                            </td>
                            <td className="py-4 px-2 text-right">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                u.is_active ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                              )}>
                                {u.is_active ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                    <ShieldAlert className="text-amber-600 shrink-0" size={18} />
                    <p className="text-[10px] font-bold text-amber-800 uppercase leading-relaxed">
                      Cuidado ao alterar níveis de acesso. Administradores podem visualizar e editar todos os dados, inclusive financeiros.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* --- TAB WIKI & SISTEMA --- */}
          {aba === 'wiki' && <SettingsWikiTab />}

          {/* --- ABA DEVOCIONAIS --- */}
          {aba === 'devocionais' && (
            <SettingsDevocionaisTab
              novaDevocional={novaDevocional}
              setNovaDevocional={setNovaDevocional}
              devocionais={devocionais}
              handleSalvarDevocional={handleSalvarDevocional}
              handleDelDevocional={handleDelDevocional}
            />
          )}
      </div>
    </div>
  );
}