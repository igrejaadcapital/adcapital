import React from 'react';
import { Loader2 } from 'lucide-react';

export default function MembroTable({ membros, onEdit, onDelete, deletandoId }) {
  
  const formatarCPF = (cpf) => {
    if (!cpf) return '---';
    const clean = cpf.replace(/\D/g, "");
    if (clean.length !== 11) return cpf;
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '---';
    try {
      const [ano, mes, dia] = dataStr.split('-');
      return `${dia}/${mes}/${ano}`;
    } catch (e) {
      return dataStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6 overflow-x-auto relative">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Função</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nascimento</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">LGPD</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {membros.map((m) => {
            const isDeleting = deletandoId === m.id;
            return (
              <tr key={m.id} className={`transition-colors group ${isDeleting ? 'bg-rose-50 opacity-50 italic' : 'hover:bg-blue-50/30'}`}>
                <td className="px-6 py-4 text-sm font-mono text-slate-500 whitespace-nowrap">
                  {formatarCPF(m.cpf)}
                </td>
                <td className="px-6 py-4">
                  <div className={`text-sm font-bold uppercase transition-colors ${isDeleting ? 'text-slate-400' : 'text-blue-900'}`}>{m.nome}</div>
                  <div className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{m.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                  {m.telefone ? (
                    <a href={`tel:${m.telefone.replace(/\D/g, "")}`} className="hover:text-blue-600 hover:underline">
                      {m.telefone}
                    </a>
                  ) : (
                    <span className="text-slate-300 italic text-xs">Não informado</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-black uppercase border transition-colors ${isDeleting ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                    {m.funcao || 'Membro'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                  {formatarData(m.data_nascimento)}
                </td>
                <td className="px-6 py-4">
                  {m.lgpd_consentido ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded border border-green-200" title={`Documento assinado recebido em: ${m.lgpd_data_aceite ? new Date(m.lgpd_data_aceite).toLocaleString('pt-BR') : 'Data não registrada'}`}>
                       ✅ Salvo
                    </span>
                  ) : m.lgpd_documento ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded border border-blue-200" title="Termo enviado por email — aguardando assinatura física e devolução">
                       📧 Enviado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded border border-amber-200" title="Termo não gerado">
                       ⏳ Pendente
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={`flex justify-end gap-2 transition-opacity ${isDeleting ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button
                      onClick={() => onEdit(m)}
                      disabled={isDeleting}
                      className="p-1.5 bg-white text-blue-600 rounded-lg border border-slate-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm disabled:opacity-20"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(m.id)}
                      disabled={isDeleting}
                      className={`p-1.5 rounded-lg border transition-all shadow-sm flex items-center justify-center min-w-[34px] ${
                        isDeleting 
                          ? 'bg-blue-50 border-blue-200 text-blue-600' 
                          : 'bg-white text-red-600 border-slate-200 hover:bg-red-600 hover:text-white'
                      }`}
                      title="Excluir"
                    >
                      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : '🗑️'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
