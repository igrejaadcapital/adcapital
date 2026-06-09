import React from 'react';
import { Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { Field } from './settingsUi';

export default function SettingsSiteTab({
  siteConfig,
  setSiteConfig,
  comentarios,
  salvarSite,
  handleDelComentario,
  deletandoId,
}) {
  if (!siteConfig) return null;

  return (
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
            <Field label="Instagram URL (Perfil)" value={siteConfig.instagram_url} onChange={(v) => setSiteConfig({ ...siteConfig, instagram_url: v })} />
            <Field label="URL do Último Post do Instagram (Feed/Reel)" value={siteConfig.ultimo_post_instagram_url} onChange={(v) => setSiteConfig({ ...siteConfig, ultimo_post_instagram_url: v })} />
            <Field label="Youtube URL" value={siteConfig.youtube_url} onChange={(v) => setSiteConfig({ ...siteConfig, youtube_url: v })} />
            <Field label="Chave PIX (Dízimos)" value={siteConfig.pix_chave} onChange={(v) => setSiteConfig({ ...siteConfig, pix_chave: v })} />
          </div>
          <div className="space-y-6">
            <Field label="Nome do Banco" value={siteConfig.banco_nome} onChange={(v) => setSiteConfig({ ...siteConfig, banco_nome: v })} />
            <Field label="Pastor Responsável" value={siteConfig.pastor_nome} onChange={(v) => setSiteConfig({ ...siteConfig, pastor_nome: v })} />
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Foto do Pastor</label>
              <input type="file" accept=".jpg,.jpeg,.png,.webp,.JPG,.JPEG,.PNG" onChange={(e) => setSiteConfig({ ...siteConfig, pastor_foto: e.target.files[0] })} className="text-xs" />
            </div>
          </div>
        </div>

        <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100/50 space-y-6">
          <h3 className="font-black text-blue-900/40 text-[10px] uppercase tracking-[0.2em] mb-2">Palavra do Pastor (Destaque no Site)</h3>
          <Field label="Título Pastoral" value={siteConfig.pastoral_titulo} onChange={(v) => setSiteConfig({ ...siteConfig, pastoral_titulo: v })} />
          <Field label="Mensagem Pastoral" isTextArea value={siteConfig.pastoral_texto} onChange={(v) => setSiteConfig({ ...siteConfig, pastoral_texto: v })} />
        </div>

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
              comentarios.map((c) => (
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
  );
}
