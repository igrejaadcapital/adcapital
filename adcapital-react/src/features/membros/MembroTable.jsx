import React, { useState } from 'react';
import { formatCpf } from '../../shared/lib/masks';
import MembroFotoAvatar from './MembroFotoAvatar';
import { Loader2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

export default function MembroTable({ membros, onEdit, onDelete, deletandoId }) {
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' ou 'desc'
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
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

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const membrosOrdenados = [...membros].sort((a, b) => {
    const nomeA = a.nome || '';
    const nomeB = b.nome || '';
    if (sortOrder === 'asc') {
      return nomeA.localeCompare(nomeB);
    } else {
      return nomeB.localeCompare(nomeA);
    }
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mt-6 overflow-x-auto relative">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="w-12 px-2 py-4"></th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[250px] cursor-pointer hover:bg-slate-100 transition-colors group"
              onClick={toggleSort}
            >
              <div className="flex items-center gap-2">
                Nome
                {sortOrder === 'asc' ? (
                  <ChevronUp size={14} className="text-blue-600" />
                ) : (
                  <ChevronDown size={14} className="text-blue-600" />
                )}
              </div>
            </th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Função</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nascimento</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">LGPD</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right min-w-[100px]">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {membrosOrdenados.map((m) => {
            const isDeleting = deletandoId === m.id;
            return (
              <React.Fragment key={m.id}>
                <tr className={`transition-colors group ${isDeleting ? 'bg-rose-50 opacity-50 italic' : 'hover:bg-blue-50/30'}`}>
                  <td className="px-2 py-4 text-center align-middle">
                    {m.parentes && m.parentes.length > 0 ? (
                      <button 
                        onClick={() => toggleRow(m.id)} 
                        className="p-1 rounded-full hover:bg-blue-100 text-blue-500 transition-colors focus:outline-none"
                        title="Ver familiares"
                      >
                        {expandedRows.has(m.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500 whitespace-nowrap">
                  {formatCpf(m.cpf)}
                </td>
                <td className="px-6 py-4 overflow-visible">
                  <div className="flex items-center gap-3 overflow-visible">
                    {/* Avatar */}
                    {m.foto ? (
                      <MembroFotoAvatar src={m.foto} nome={m.nome} size="sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-110">
                        <span className="text-white font-black text-xs leading-none">{m.nome?.charAt(0) || '?'}</span>
                      </div>
                    )}
                    <div>
                      <div className={`text-sm font-bold uppercase transition-colors ${isDeleting ? 'text-slate-400' : 'text-blue-900'}`}>{m.nome}</div>
                      <div className="text-[10px] text-slate-400 font-medium truncate">{m.email}</div>
                    </div>
                  </div>
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
                  <div className={`flex justify-end gap-2 transition-opacity ${isDeleting ? 'opacity-50' : ''}`}>
                    <button
                      onClick={() => onEdit(m)}
                      disabled={isDeleting}
                      className="p-1.5 bg-white text-blue-600 rounded-lg border border-slate-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm disabled:opacity-20"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(m)}
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
              {expandedRows.has(m.id) && m.parentes && m.parentes.length > 0 && (
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <td colSpan={8} className="px-6 py-4 bg-slate-50/50">
                    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm relative overflow-hidden ml-10">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>👨‍👩‍👧‍👦 Vínculos Familiares</span>
                        <span className="bg-slate-200 text-slate-600 py-0.5 px-2 rounded-full text-[10px]">{m.parentes.length}</span>
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {m.parentes.map((p, idx) => (
                          <li key={idx} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 border border-slate-100 transition-colors bg-white">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {p.nome_parente ? p.nome_parente.charAt(0) : '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-700 truncate">{p.nome_parente}</p>
                              <p className="text-[10px] uppercase font-black text-slate-400">{p.grau}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
