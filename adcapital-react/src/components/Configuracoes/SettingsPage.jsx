import React, { useState, useEffect } from 'react';
import configuracaoService from '../../api/configuracaoService';
import { 
  Globe, 
  ImageIcon, 
  Calendar, 
  Save, 
  Trash2, 
  Plus, 
  Upload, 
  ExternalLink,
  BookOpen,
  Info,
  Settings,
  ShieldAlert,
  Layers,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import StatusView from '../Common/StatusView';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function SettingsPage() {
  const [aba, setAba] = useState('geral');
  const [funcoes, setFuncoes] = useState([]);
  const [categoriasEntrada, setCategoriasEntrada] = useState([]);
  const [categoriasSaida, setCategoriasSaida] = useState([]);
  const [portalConfig, setPortalConfig] = useState({ is_ativo: true, pergunta: '', resposta: '' });
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
  const [editProg, setEditProg] = useState(null);
  const [novaProg, setNovaProg] = useState({ dia_semana: 0, titulo: '', horario: '', ordem: 0 });
  const [deletandoId, setDeletandoId] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(false);
      const [fRes, cRes, pRes, sRes, gRes, pgRes] = await Promise.all([
        configuracaoService.listarFuncoes(),
        configuracaoService.listarCategorias(),
        configuracaoService.getPortalConfig(),
        configuracaoService.getSiteConfig(),
        configuracaoService.getGaleria(),
        configuracaoService.getProgramacao()
      ]);
      
      setFuncoes(fRes.data);
      setCategoriasEntrada(cRes.data.filter(c => c.tipo === 'ENTRADA'));
      setCategoriasSaida(cRes.data.filter(c => c.tipo === 'SAIDA'));
      setPortalConfig(pRes.data);
      setSiteConfig(sRes.data);
      setProgramacao(pgRes.data);
      setGaleria(gRes.data);
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
                        <Field label="Instagram URL" value={siteConfig.instagram_url} onChange={v => setSiteConfig({...siteConfig, instagram_url: v})} />
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
          )}

          {/* --- TAB WIKI & SISTEMA --- */}
          {aba === 'wiki' && (
            <section className="space-y-8 pb-20">
               {/* Cabeçalho Wiki */}
               <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                        <BookOpen size={24} />
                     </div>
                     <div>
                        <h2 className="font-black uppercase text-sm tracking-widest">Wiki do Sistema</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Documentação Técnica, Infraestrutura e Manual de Operações</p>
                     </div>
                  </div>
               </div>

               {/* Stack Tecnológica + URLs */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-[2.5rem] p-8 shadow-md border border-slate-100 space-y-6">
                     <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                        <Layers size={14} /> Stack Tecnológica
                     </h3>
                     <div className="space-y-4">
                        <TechItem label="Frontend" value="React 19 + Vite + Tailwind CSS" />
                        <TechItem label="Backend" value="Django 6.0 (Python 3)" />
                        <TechItem label="API" value="Django REST Framework" />
                        <TechItem label="Banco de Dados" value="PostgreSQL (Supabase)" />
                        <TechItem label="Servidor Web" value="Gunicorn 25.1" />
                        <TechItem label="Mídia/Fotos" value="Cloudinary (CDN)" />
                        <TechItem label="E-mail" value="Resend API (HTTPS)" />
                        <TechItem label="DNS/CDN" value="Cloudflare" />
                        <TechItem label="Hospedagem" value="Render (Free Tier)" />
                        <TechItem label="Domínio" value="Registro.br" />
                        <TechItem label="PDF" value="ReportLab" />
                     </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-8 shadow-md border border-slate-100 space-y-6">
                     <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                        <ExternalLink size={14} /> URLs do Sistema
                     </h3>
                     <div className="space-y-3">
                        <UrlItem label="Site Institucional" url="adcapitaligreja.com.br" />
                        <UrlItem label="Sistema Admin" url="sistema.adcapitaligreja.com.br" />
                        <UrlItem label="Portal de Cadastro" url="cadastro.adcapitaligreja.com.br" />
                        <UrlItem label="API Backend" url="api.adcapitaligreja.com.br" />
                        <UrlItem label="Django Admin" url="api.adcapitaligreja.com.br/admin/" />
                     </div>
                  </div>
               </div>

               {/* Contas e Serviços */}
               <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-8">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-violet-600 flex items-center gap-2">
                     <ShieldAlert size={14} /> Contas e Serviços de Infraestrutura
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                     Todos os serviços abaixo estão vinculados à conta <span className="text-slate-600">igrejaadcapital@gmail.com</span>. Mantenha as credenciais seguras.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                     <ServiceCard name="Registro.br" role="Registro de Domínio" detail="adcapitaligreja.com.br" url="registro.br" color="green" />
                     <ServiceCard name="Cloudflare" role="DNS, CDN e Proteção" detail="Nameservers, Proxy, SSL, Cache" url="dash.cloudflare.com" color="orange" />
                     <ServiceCard name="Render" role="Hospedagem" detail="adcapital-api (Web Service) + adcapital-web (Static Site)" url="dashboard.render.com" color="blue" />
                     <ServiceCard name="Supabase" role="Banco de Dados PostgreSQL" detail="Região: sa-east-1 (São Paulo)" url="supabase.com/dashboard" color="emerald" />
                     <ServiceCard name="Cloudinary" role="Armazenamento de Mídia" detail="Fotos, galeria, termos LGPD (PDF)" url="console.cloudinary.com" color="blue" />
                     <ServiceCard name="Resend" role="E-mail Transacional" detail="Domínio: adcapitaligreja.com.br | noreply@adcapitaligreja.com.br" url="resend.com" color="slate" />
                     <ServiceCard name="GitHub" role="Repositório de Código" detail="igrejaadcapital/adcapital (main)" url="github.com/igrejaadcapital/adcapital" color="slate" />
                     <ServiceCard name="Google" role="Calendar + Credenciais" detail="Sincronização de eventos via API" url="calendar.google.com" color="blue" />
                  </div>
               </div>

               {/* Arquitetura */}
               <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-8">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Arquitetura do Sistema</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100/50 space-y-4">
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Frontend (Render Static Site)</h4>
                        <div className="space-y-2 text-[10px] font-bold text-slate-600">
                           <p>• React 19 + Vite (pasta adcapital-react/)</p>
                           <p>• Build: npm run build → dist/</p>
                           <p>• Autenticação via token JWT</p>
                           <p>• Axios com timeout de 120s (cold start)</p>
                        </div>
                     </div>
                     <div className="p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50 space-y-4">
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Backend (Render Web Service)</h4>
                        <div className="space-y-2 text-[10px] font-bold text-slate-600">
                           <p>• Django 6.0 + Gunicorn (porta 10000)</p>
                           <p>• Apps: membros, financeiro, agenda</p>
                           <p>• Tarefas pesadas (PDF, e-mail) em threads background</p>
                           <p>• Auto-deploy via git push (branch main)</p>
                        </div>
                     </div>
                  </div>
                  <div className="p-6 bg-amber-50/50 rounded-[2rem] border border-amber-100/50 space-y-4">
                     <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Fluxo de Deploy</h4>
                     <div className="flex items-center gap-3 flex-wrap text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">Código Local</span>
                        <span className="text-slate-300">→</span>
                        <span className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">Git Push</span>
                        <span className="text-slate-300">→</span>
                        <span className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">GitHub</span>
                        <span className="text-slate-300">→</span>
                        <span className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">Render Build</span>
                        <span className="text-slate-300">→</span>
                        <span className="bg-emerald-500 text-white px-4 py-2 rounded-full shadow-sm">Produção</span>
                     </div>
                  </div>
               </div>

               {/* Variáveis de Ambiente */}
               <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-6">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-rose-500 flex items-center gap-2">
                     <ShieldAlert size={14} /> Variáveis de Ambiente (Render)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     <EnvItem name="DATABASE_URL" desc="Connection string PostgreSQL (Supabase)" />
                     <EnvItem name="SECRET_KEY" desc="Chave secreta do Django" />
                     <EnvItem name="ALLOWED_HOSTS" desc="Domínios permitidos pela API" />
                     <EnvItem name="RESEND_API_KEY" desc="Chave API do Resend (e-mail)" />
                     <EnvItem name="CLOUDINARY_CLOUD_NAME" desc="Nome do cloud Cloudinary" />
                     <EnvItem name="CLOUDINARY_API_KEY" desc="Chave pública Cloudinary" />
                     <EnvItem name="CLOUDINARY_API_SECRET" desc="Chave secreta Cloudinary" />
                     <EnvItem name="GOOGLE_CREDENTIALS_JSON" desc="Credenciais Google Calendar" />
                  </div>
               </div>

               {/* Modelo de Dados */}
               <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-8">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Modelo de Dados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <DataCard title="Membros" fields={['Nome, CPF (Único), RG', 'Status, Função (FK)', 'Foto, E-mail, Telefone', 'LGPD: Consentimento + PDF', 'Parentesco (FK bidirecional)']} />
                      <DataCard title="Finanças" fields={['Transação (Tipo +/-)', 'Valor, Data', 'Categoria (FK)', 'Descrição']} />
                      <DataCard title="Agenda" fields={['Evento', 'Data Início/Fim', 'Google Calendar Sync ID']} />
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed text-center">
                         Parentescos são bidirecionais automáticos. Finanças categorizadas para relatórios. Termos LGPD gerados automaticamente e armazenados no Cloudinary.
                      </p>
                  </div>
               </div>

               {/* Sistema de E-mail */}
               <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-6">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-2">
                     <Info size={14} /> Sistema de E-mail
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50 space-y-3">
                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Configuração</h4>
                        <div className="space-y-2 text-[10px] font-bold text-slate-600">
                           <p>• Provedor: Resend (API HTTPS)</p>
                           <p>• Remetente: noreply@adcapitaligreja.com.br</p>
                           <p>• Reply-To: igrejaadcapital@gmail.com</p>
                           <p>• Domínio verificado via DNS (Cloudflare)</p>
                        </div>
                     </div>
                     <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50 space-y-3">
                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Quando é enviado</h4>
                        <div className="space-y-2 text-[10px] font-bold text-slate-600">
                           <p>• Novo cadastro no portal público</p>
                           <p>• Anexo: Termo LGPD em PDF</p>
                           <p>• Processado em thread background</p>
                           <p>• Funciona para Gmail, Hotmail, Yahoo, etc.</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Backup */}
               <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/40 space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-white/10 rounded-2xl">
                        <Save size={24} className="text-blue-400" />
                     </div>
                     <div>
                        <h3 className="font-black uppercase text-xs tracking-widest">Procedimento de Backup</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Segurança e Exportação de Dados</p>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        Para realizar uma cópia completa dos dados, execute no terminal da pasta do projeto:
                     </p>
                     <div className="bg-black/40 p-5 rounded-2xl border border-white/5 font-mono text-xs text-blue-300 flex justify-between items-center group">
                        <code>.\venv\Scripts\python.exe fast_backup.py</code>
                        <span className="text-[9px] font-black text-white/20 uppercase group-hover:text-white/40 transition-all">PowerShell</span>
                     </div>
                     <ul className="space-y-2 pt-2">
                        <li className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                           <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Arquivo: backup_adcapital.json
                        </li>
                        <li className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                           <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Destino: Nuvem ou HD Externo
                        </li>
                        <li className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                           <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Frequência: Semanal
                        </li>
                     </ul>
                  </div>
               </div>

               {/* Notas */}
               <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-200/50 space-y-4">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-amber-700 flex items-center gap-2">
                     <Info size={14} /> Notas Importantes
                  </h3>
                  <div className="space-y-3 text-[10px] font-bold text-amber-800/70 leading-relaxed">
                     <p>• <strong>Cold Start:</strong> Render Free desliga após inatividade (~15min). Primeira requisição pode demorar até 50s.</p>
                     <p>• <strong>SMTP Bloqueado:</strong> Render Free bloqueia portas SMTP. Usamos API HTTPS do Resend.</p>
                     <p>• <strong>Limite de E-mail:</strong> Resend Free: 100 emails/dia, 3.000/mês.</p>
                     <p>• <strong>Armazenamento:</strong> Fotos e PDFs ficam no Cloudinary (servidor Render é efêmero).</p>
                     <p>• <strong>Deploy:</strong> Todo git push na branch main inicia deploy automático no Render.</p>
                  </div>
               </div>
            </section>
          )}
      </div>
    </div>
  );
}

// COMPONENTES AUXILIARES PARA WIKI
function TechItem({ label, value }) {
  return (
    <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl border border-slate-50">
       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</span>
       <span className="text-xs font-bold text-slate-700">{value}</span>
    </div>
  );
}

function UrlItem({ label, url }) {
  return (
    <a href={`https://${url}`} target="_blank" rel="noreferrer" className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group">
       <div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{label}</p>
          <p className="text-xs font-mono font-bold text-blue-600">{url}</p>
       </div>
       <ExternalLink size={14} className="text-slate-200 group-hover:text-blue-400 transition-all" />
    </a>
  );
}

function DataCard({ title, fields }) {
  return (
    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3">
       <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{title}</h4>
       <div className="space-y-1.5">
          {fields.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
               <div className="w-1 h-1 bg-slate-300 rounded-full" />
               {f}
            </div>
          ))}
       </div>
    </div>
  );
}

function ServiceCard({ name, role, detail, url, color }) {
  const colors = {
    green: "border-emerald-200 bg-emerald-50/30",
    orange: "border-orange-200 bg-orange-50/30",
    blue: "border-blue-200 bg-blue-50/30",
    emerald: "border-emerald-200 bg-emerald-50/30",
    slate: "border-slate-200 bg-slate-50/30",
  };
  return (
    <a href={`https://${url}`} target="_blank" rel="noreferrer" className={cn("p-5 rounded-2xl border space-y-2 hover:shadow-md transition-all group", colors[color] || colors.blue)}>
       <div className="flex justify-between items-start">
          <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">{name}</h4>
          <ExternalLink size={12} className="text-slate-300 group-hover:text-blue-400 transition-all" />
       </div>
       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{role}</p>
       <p className="text-[10px] font-bold text-slate-400 leading-relaxed">{detail}</p>
    </a>
  );
}

function EnvItem({ name, desc }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-50">
       <code className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-md whitespace-nowrap">{name}</code>
       <span className="text-[10px] font-bold text-slate-400">{desc}</span>
    </div>
  );
}

// COMPONENTES AUXILIARES ORIGINAIS

// COMPONENTES AUXILIARES
function ArquiteturaItem({ icon, title, subtitle, text }) {
  return (
    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-2">
       <div className="flex items-center gap-3 text-blue-600 mb-2">
         {icon}
         <span className="font-black uppercase text-[10px] tracking-widest">{title}</span>
       </div>
       <p className="font-bold text-xs text-slate-800">{subtitle}</p>
       <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{text}</p>
    </div>
  );
}

function Field({ label, value, onChange, onBlur, isTextArea, isUpper }) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">{label}</label>
      {isTextArea ? (
        <textarea className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]" 
          value={value || ''} 
          onChange={e => onChange(e.target.value)} 
          onBlur={e => onBlur && onBlur(e.target.value)} 
        />
      ) : (
        <input className={cn("p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all", isUpper && "uppercase")} 
          value={value || ''} 
          onChange={e => onChange(e.target.value)} 
          onBlur={e => onBlur && onBlur(e.target.value)} 
        />
      )}
    </div>
  );
}

function SettingsBox({ title, color, data, onAdd, onDelete }) {
  const [val, setVal] = useState('');
  const [deletandoId, setDeletandoId] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  const styles = {
    blue: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-100" },
    emerald: { bg: "bg-emerald-600", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-100" },
    rose: { bg: "bg-rose-600", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-100" }
  };
  
  const currentStyle = styles[color] || styles.blue;

  const handleExcluir = async (id) => {
    if (confirm('Deseja realmente excluir este item?')) {
      setDeletandoId(id);
      try {
        await onDelete(id);
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir. Tente novamente.");
      } finally {
        setDeletandoId(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden h-[500px] flex flex-col relative">
      <div className={cn("p-6 text-center font-black uppercase text-xs tracking-widest text-white relative transition-all", currentStyle.bg, sucesso && "bg-emerald-500")}>
        {sucesso ? (
          <div className="flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle size={14} /> Sucesso!
          </div>
        ) : title}
      </div>
      
      <div className="p-6">
        <div className={cn("flex items-center gap-2 p-1.5 rounded-2xl border transition-all focus-within:ring-4", currentStyle.light, currentStyle.border, color === 'blue' ? 'focus-within:ring-blue-500/10' : color === 'emerald' ? 'focus-within:ring-emerald-500/10' : 'focus-within:ring-rose-500/10')}>
           <input 
             type="text" 
             className="flex-1 bg-transparent p-2.5 font-bold text-sm outline-none px-4 text-slate-700 placeholder:text-slate-300" 
             placeholder="Novo item..." 
             value={val} 
             onChange={e => setVal(e.target.value)}
             onKeyDown={e => {
                if (e.key === 'Enter' && val) {
                  onAdd(val);
                  setVal('');
                }
             }}
           />
           <button 
             onClick={() => {if(val) onAdd(val); setVal('')}} 
             className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-sm", currentStyle.bg)}
           >
              <Plus size={20} strokeWidth={3} />
           </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-2">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
             <Plus size={40} className="mb-2" />
             <p className="text-[10px] font-black uppercase tracking-widest">Nenhum item</p>
          </div>
        ) : (
          data.map(d => (
            <div key={d.id} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-50 hover:bg-white hover:border-slate-100 hover:shadow-sm transition-all group">
               <span className={cn("font-bold text-sm transition-all", deletandoId === d.id ? "text-slate-300 italic" : "text-slate-700")}>
                {d.nome}
               </span>
               <button 
                 onClick={() => handleExcluir(d.id)} 
                 disabled={deletandoId !== null}
                 className={cn("p-2 rounded-lg transition-all", 
                   deletandoId === d.id ? "text-blue-600 bg-blue-50" : "text-slate-200 hover:text-rose-500 hover:bg-rose-50"
                 )}
               >
                  {deletandoId === d.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
               </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
