import React from 'react';
import { Info, ShieldAlert } from 'lucide-react';
import { cn, Field } from './settingsUi';

export default function SettingsSegurancaTab({
  portalConfig,
  setPortalConfig,
  usuarios,
  salvarSeguranca,
  handleMudarPapel,
}) {
  if (!portalConfig) return null;

  return (
    <div className="space-y-8">
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
              <div
                className={cn('w-14 h-8 rounded-full relative cursor-pointer transition-all', portalConfig.is_ativo ? 'bg-emerald-500' : 'bg-slate-300')}
                onClick={() => setPortalConfig({ ...portalConfig, is_ativo: !portalConfig.is_ativo })}
              >
                <div className={cn('absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm', portalConfig.is_ativo ? 'translate-x-6' : 'translate-x-0')} />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-800 uppercase tracking-widest">Portal Ativo</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Define se o auto-cadastro está aberto ao público</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Pergunta de Acesso" value={portalConfig.pergunta} onChange={(v) => setPortalConfig({ ...portalConfig, pergunta: v })} />
              <Field label="Resposta Correta (Senha)" value={portalConfig.resposta} onChange={(v) => setPortalConfig({ ...portalConfig, resposta: v })} />
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
            <Info className="text-blue-600 shrink-0" size={20} />
            <div>
              <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">Dica de Segurança</p>
              <p className="text-[10px] text-blue-800/60 font-bold leading-relaxed">
                A resposta correta funciona como uma senha compartilhada para sua igreja. Informe esta resposta aos membros que desejam se cadastrar.
              </p>
            </div>
          </div>
        </div>
      </section>

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
                {usuarios.map((u) => (
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
                        'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest',
                        u.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
                      )}
                      >
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
  );
}
