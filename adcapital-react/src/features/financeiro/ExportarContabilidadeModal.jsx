import { useState } from 'react';
import financeiroService from '../../api/financeiroService';

function primeiroDiaDoMesAtual() {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
}

function hojeIso() {
  return new Date().toISOString().slice(0, 10);
}

function nomeArquivoDownload(dataInicio, dataFim) {
  const base = 'contabilidade_adcapital';
  if (dataInicio && dataFim) return `${base}_${dataInicio}_ate_${dataFim}.xlsx`;
  if (dataInicio) return `${base}_desde_${dataInicio}.xlsx`;
  if (dataFim) return `${base}_ate_${dataFim}.xlsx`;
  return `${base}.xlsx`;
}

export default function ExportarContabilidadeModal({ isOpen, onClose }) {
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMesAtual());
  const [dataFim, setDataFim] = useState(hojeIso());
  const [tipo, setTipo] = useState('TODOS');
  const [incluirLancamentos, setIncluirLancamentos] = useState(true);
  const [incluirAbasSeparadas, setIncluirAbasSeparadas] = useState(true);
  const [incluirResumo, setIncluirResumo] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleExportar = async () => {
    if (!incluirLancamentos && !incluirAbasSeparadas && !incluirResumo) {
      alert('Selecione ao menos uma opção de conteúdo para exportar.');
      return;
    }
    if (dataInicio && dataFim && dataInicio > dataFim) {
      alert('A data inicial não pode ser posterior à data final.');
      return;
    }

    setLoading(true);
    try {
      const response = await financeiroService.exportarContabilidade({
        data_inicio: dataInicio || undefined,
        data_fim: dataFim || undefined,
        tipo,
        incluir_lancamentos: incluirLancamentos,
        incluir_abas_separadas: incluirAbasSeparadas,
        incluir_resumo: incluirResumo,
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivoDownload(dataInicio, dataFim);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data instanceof Blob
          ? 'Não foi possível gerar o relatório.'
          : typeof err.response?.data === 'string'
            ? err.response.data
            : err.response?.data?.detail || 'Erro ao exportar relatório para contabilidade.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800">Relatório para Contabilidade</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Excel com entradas e saídas
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            ✕
          </button>
        </div>

        <div className="p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                Data inicial
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                Data final
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              Tipo de lançamento
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="TODOS">Entradas e saídas</option>
              <option value="ENTRADA">Somente entradas</option>
              <option value="SAIDA">Somente saídas</option>
            </select>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Conteúdo da planilha
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={incluirLancamentos}
                onChange={(e) => setIncluirLancamentos(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-sm font-bold text-slate-700">Lançamentos detalhados (todos no período)</span>
            </label>
            <label className={`flex items-center gap-3 cursor-pointer ${tipo !== 'TODOS' ? 'opacity-40' : ''}`}>
              <input
                type="checkbox"
                checked={incluirAbasSeparadas}
                disabled={tipo !== 'TODOS'}
                onChange={(e) => setIncluirAbasSeparadas(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-sm font-bold text-slate-700">Abas separadas (Entradas / Saídas)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={incluirResumo}
                onChange={(e) => setIncluirResumo(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-sm font-bold text-slate-700">Resumo (totais, categorias e mensal)</span>
            </label>
          </div>
        </div>

        <div className="p-8 pt-0 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleExportar}
            disabled={loading}
            className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg disabled:opacity-60"
          >
            {loading ? 'Gerando…' : 'Baixar Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}
