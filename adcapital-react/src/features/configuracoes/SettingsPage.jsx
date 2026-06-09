import React, { useState, useEffect } from 'react';
import configuracaoService from '../../api/configuracaoService';
import api from '../../api/config';
import { 
  Globe, 
  ImageIcon, 
  Calendar, 
  BookOpen,
  Settings,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import StatusView from '../../shared/components/StatusView';
import { cn } from './settings/settingsUi';
import SettingsWikiTab from './settings/SettingsWikiTab';
import SettingsDevocionaisTab from './settings/SettingsDevocionaisTab';
import SettingsGeralTab from './settings/SettingsGeralTab';
import SettingsSiteTab from './settings/SettingsSiteTab';
import SettingsProgramacaoTab from './settings/SettingsProgramacaoTab';
import SettingsGaleriaTab from './settings/SettingsGaleriaTab';
import SettingsSegurancaTab from './settings/SettingsSegurancaTab';

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
            <SettingsGeralTab
              funcoes={funcoes}
              categoriasEntrada={categoriasEntrada}
              categoriasSaida={categoriasSaida}
              configuracaoService={configuracaoService}
              carregarDados={carregarDados}
            />
          )}

          {aba === 'site' && (
            <SettingsSiteTab
              siteConfig={siteConfig}
              setSiteConfig={setSiteConfig}
              comentarios={comentarios}
              salvarSite={salvarSite}
              handleDelComentario={handleDelComentario}
              deletandoId={deletandoId}
            />
          )}

          {aba === 'programacao' && (
            <SettingsProgramacaoTab
              programacao={programacao}
              novaProg={novaProg}
              setNovaProg={setNovaProg}
              handleSalvarProg={handleSalvarProg}
              handleDelProg={handleDelProg}
              deletandoId={deletandoId}
            />
          )}

          {aba === 'galeria' && (
            <SettingsGaleriaTab
              galeria={galeria}
              handleAddFoto={handleAddFoto}
              handleDelFoto={handleDelFoto}
              deletandoId={deletandoId}
            />
          )}

          {aba === 'seguranca' && (
            <SettingsSegurancaTab
              portalConfig={portalConfig}
              setPortalConfig={setPortalConfig}
              usuarios={usuarios}
              salvarSeguranca={salvarSeguranca}
              handleMudarPapel={handleMudarPapel}
            />
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