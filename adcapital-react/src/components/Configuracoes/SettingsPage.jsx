import React, { useState, useEffect } from 'react';
import configuracaoService from '../../api/configuracaoService';
import { 
  Globe, 
  Image as ImageIcon, 
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
  Image
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

  const carregarDados = async () => {
    try {
      setLoading(true);
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
      if (key !== 'pastor_foto' || typeof siteConfig[key] !== 'string') {
        formData.append(key, siteConfig[key]);
      }
    });
    try {
      await configuracaoService.saveSiteConfig(formData);
      alert("Configurações do site salvas!");
      await carregarDados();
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const handleAddFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('imagem', file);
    formData.append('legenda', 'Foto da Igreja');
    await configuracaoService.uploadFotoGaleria(formData);
    carregarDados();
  };

  const handleSalvarProg = async () => {
    if (!novaProg.titulo || !novaProg.horario) return alert("Preencha o título e o horário.");
    await configuracaoService.saveProgramacao(novaProg);
    setNovaProg({ dia_semana: 0, titulo: '', horario: '', ordem: 0 });
    carregarDados();
  };

  const handleDelProg = async (id) => {
    if (confirm('Excluir este horário?')) {
      await configuracaoService.deleteProgramacao(id);
      carregarDados();
    }
  };

  if (loading && !siteConfig) return <div className="p-8 text-center font-black animate-pulse">CARREGANDO...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[80vh] p-4 text-slate-800">
      
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
          <Image size={18} /> Galeria
        </button>
        <button onClick={() => setAba('seguranca')} className={cn("w-full p-4 rounded-3xl flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest", aba === 'seguranca' ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50")}>
          <ShieldAlert size={18} /> Segurança
        </button>
      </aside>

      <div className="flex-1">
          {/* --- ABA GERAIS --- */}
          {aba === 'geral' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SettingsBox title="Funções" color="blue" data={funcoes} 
                 onAdd={v => configuracaoService.adicionarFuncao({nome: v}).then(carregarDados)}
                 onDelete={id => configuracaoService.excluirFuncao(id).then(carregarDados)} />
              <SettingsBox title="Categorias (+)" color="emerald" data={categoriasEntrada} 
                 onAdd={v => configuracaoService.adicionarCategoria({nome: v, tipo: 'ENTRADA'}).then(carregarDados)}
                 onDelete={id => configuracaoService.excluirCategoria(id).then(carregarDados)} />
              <SettingsBox title="Categorias (-)" color="rose" data={categoriasSaida} 
                 onAdd={v => configuracaoService.adicionarCategoria({nome: v, tipo: 'SAIDA'}).then(carregarDados)}
                 onDelete={id => configuracaoService.excluirCategoria(id).then(carregarDados)} />
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
                           <input type="file" onChange={e => setSiteConfig({...siteConfig, pastor_foto: e.target.files[0]})} className="text-xs" />
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
                       <button onClick={() => handleDelProg(p.id)} className="p-3 text-rose-500 opacity-20 group-hover:opacity-100 transition-all hover:bg-rose-50 rounded-xl">
                          <Trash2 size={18} />
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
                      <input type="file" className="hidden" multiple accept="image/*" onChange={handleAddFoto} />
                   </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                   {galeria.map(f => (
                     <div key={f.id} className="aspect-square bg-slate-50 rounded-[2rem] overflow-hidden relative group border border-slate-100">
                        <img src={f.imagem} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-rose-600/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                           <button onClick={() => configuracaoService.excluirFotoGaleria(f.id).then(carregarDados)} className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                              <Trash2 size={16} /> Excluir
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
          {aba === 'seguranca' && (
            <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
               <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h2 className="font-black uppercase text-xs tracking-widest">Segurança do Portal</h2>
                  <button 
                    onClick={() => configuracaoService.savePortalConfig({...portalConfig, is_ativo: !portalConfig.is_ativo}).then(carregarDados)}
                    className={cn("px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg transition-all", portalConfig.is_ativo ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-rose-500 text-white shadow-rose-500/20")}
                  >
                    {portalConfig.is_ativo ? 'Portal Ativo' : 'Portal Inativo'}
                  </button>
               </div>
               <div className="p-8 space-y-6">
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex items-center gap-6 mb-4">
                     <ShieldAlert className="text-slate-400" size={32} />
                     <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed tracking-wider">A pergunta e resposta de segurança são exibidas para pessoas que tentam acessar o formulário de cadastro pelo site principal.</p>
                  </div>
                  <Field label="Pergunta de Segurança" value={portalConfig.pergunta} onChange={v => setPortalConfig({...portalConfig, pergunta: v})} 
                    onBlur={v => configuracaoService.savePortalConfig({...portalConfig, pergunta: v})} />
                  <Field label="Resposta Exata (Senhárea)" value={portalConfig.resposta} onChange={v => setPortalConfig({...portalConfig, resposta: v})} 
                    onBlur={v => configuracaoService.savePortalConfig({...portalConfig, resposta: v})} isUpper />
               </div>
            </section>
          )}
      </div>
    </div>
  );
}

// COMPONENTES AUXILIARES
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
  const styles = {
    blue: "bg-blue-600 text-white shadow-blue-500/10",
    emerald: "bg-emerald-600 text-white shadow-emerald-500/10",
    rose: "bg-rose-600 text-white shadow-rose-500/10"
  };
  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-visible h-[500px] flex flex-col">
      <div className={cn("p-6 text-center rounded-t-[2.5rem] font-black uppercase text-xs tracking-widest", styles[color])}>{title}</div>
      <div className="p-6">
        <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
           <input type="text" className="flex-1 bg-transparent p-3 font-bold text-sm outline-none px-4" 
             placeholder="Novo item..." value={val} onChange={e => setVal(e.target.value)} />
           <button onClick={() => {if(val) onAdd(val); setVal('')}} className="bg-slate-900 text-white w-12 h-12 rounded-xl font-black text-xl hover:scale-105 transition-all shadow-lg">+</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-3">
        {data.map(d => (
          <div key={d.id} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-50 hover:bg-white hover:shadow-md transition-all group">
             <span className="font-bold text-slate-700 text-sm">{d.nome}</span>
             <button onClick={() => onDelete(d.id)} className="text-slate-300 hover:text-rose-500 transition-all">
                <Trash2 size={16} />
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}
