import { AlertCircle, RefreshCcw, Loader2 } from 'lucide-react';
import { useState } from 'react';
import LancamentoFinanceiroFormModal from './ModalLancamentosFinanceiro/LancamentoFinanceiroFormModal';
import financeiroService from '../../api/financeiroService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function FinanceiroMain({
    transacoes,
    transacoesFiltradas,
    buscaTexto, setBuscaTexto,
    buscaMes, setBuscaMes,
    atualizarTransacoes,
    totalEntradas,
    totalSaidas,
    saldoAtual,
    categoriasEntrada,
    categoriasSaida,
    adicionarCategoriaEntrada,
    adicionarCategoriaSaida,
    loading,
    error
}) {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [tipoLancamento, setTipoLancamento] = useState('ENTRADA');
    const [lancamentoParaEditar, setLancamentoParaEditar] = useState(null);

    const abrirModalNovo = (tipo) => {
        setLancamentoParaEditar(null);
        setTipoLancamento(tipo);
        setMostrarModal(true);
    };

    const abrirEdicao = (t) => {
        setLancamentoParaEditar(t);
        setTipoLancamento(t.tipo);
        setMostrarModal(true);
    };

    const handleSave = async (dados) => {
        const dadosTratados = {
            ...dados,
            descricao: dados.descricao?.trim() ? dados.descricao : dados.categoria
        };

        try {
            await financeiroService.salvar(lancamentoParaEditar?.id, dadosTratados);
            atualizarTransacoes();
            setMostrarModal(false);
        } catch(e) {
            console.error(e);
            alert("Erro ao salvar." + (e.response?.data ? JSON.stringify(e.response.data) : ""));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Deseja realmente excluir este lançamento?")) {
            try {
                await financeiroService.excluir(id);
                atualizarTransacoes();
            } catch(e) {
                console.error(e);
                alert("Erro ao remover.");
            }
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2.5rem] border border-rose-100 shadow-xl space-y-6">
                <AlertCircle size={48} className="text-rose-500" />
                <div className="text-center">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Erro no balanço financeiro</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-2">O banco de dados demorou a responder. Isso pode acontecer após inatividade.</p>
                </div>
                <button 
                    onClick={atualizarTransacoes}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all"
                >
                    <RefreshCcw size={16} /> Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6 animate-in fade-in duration-500 relative">
            {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-[2.5rem]">
                   <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            )}
            {/* Cards de Saldo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-900 rounded-3xl p-6 text-white shadow-xl">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Saldo Atual</p>
                    <h2 className="text-3xl font-black italic">R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Entradas (Mês)</p>
                    <h2 className="text-2xl font-black text-slate-800">R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Saídas</p>
                    <h2 className="text-2xl font-black text-slate-800">R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                </div>
            </div>

            {/* Gráfico de Visão Geral */}
            {(totalEntradas > 0 || totalSaidas > 0) && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col items-center">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Proporção (Entradas vs Saídas)</h3>
                    <div className="w-full h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Entradas', value: totalEntradas },
                                        { name: 'Saídas', value: totalSaidas }
                                    ]}
                                    innerRadius={40}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip formatter={(val) => `R$ ${val.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Barra de Filtros - Alinhamento Natural */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 items-end">

                {/* Busca por Texto */}
                <div className="flex-1 w-full flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                        Pesquisar Lançamento
                    </label>
                    <input
                        type="text"
                        placeholder="Descrição ou categoria..."
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10"
                        value={buscaTexto}
                        onChange={(e) => setBuscaTexto(e.target.value)}
                    />
                </div>

                {/* Seleção de Mês - Sem dd/mm/aaaa */}
                <div className="w-full md:w-64 flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                        Mês do Lançamento
                    </label>
                    <div className="relative w-full flex">
                        <input
                            type="date"
                            value={buscaMes ? `${buscaMes}-01` : ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val) setBuscaMes(val.substring(0, 7));
                                else setBuscaMes('');
                            }}
                            // p-4 mantém a altura idêntica ao input de texto ao lado
                            className={`w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none cursor-pointer ${buscaMes ? 'text-transparent' : 'text-slate-400'}`}
                        />

                        {/* Texto do Mês formatado (Sobreposição) */}
                        {buscaMes && (
                            <div className="absolute inset-0 flex items-center pl-4 pointer-events-none">
                                <span className="text-sm font-black text-blue-600 uppercase">
                                    {new Date(buscaMes + "-01T12:00:00").toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        )}

                        {/* Botão de Limpar compacto */}
                        {buscaMes && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setBuscaMes(''); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/50 backdrop-blur-sm text-red-500 p-1.5 rounded-xl hover:bg-white transition-all shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button onClick={() => abrirModalNovo('ENTRADA')} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-all">
                    + Novo Depósito
                </button>
                <button onClick={() => abrirModalNovo('SAIDA')} className="bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-red-600 transition-all">
                    - Novo Saque
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição / Categoria</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-28">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {transacoesFiltradas.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 text-xs font-bold text-slate-500">{new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700 flex items-center gap-2">
                                            {t.descricao?.trim() ? t.descricao : t.categoria}
                                            {t.comprovante && <span title="Possui comprovante anexo" className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black">📎 Anexo</span>}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            {t.categoria}
                                        </span>
                                    </div>
                                </td>
                                <td className={`p-4 text-right font-black text-sm ${t.tipo === 'ENTRADA' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {t.tipo === 'ENTRADA' ? '+ ' : '- '} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => abrirEdicao(t)}
                                            className="p-2 text-slate-400 hover:text-blue-600 transition-all"
                                            title="Editar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 transition-all"
                                            title="Excluir"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {mostrarModal && (
                <LancamentoFinanceiroFormModal
                    categorias={tipoLancamento === 'ENTRADA' ? categoriasEntrada : categoriasSaida}
                    onAdicionarCategoria={tipoLancamento === 'ENTRADA' ? adicionarCategoriaEntrada : adicionarCategoriaSaida}
                    tipo={tipoLancamento}
                    lancamento={lancamentoParaEditar}
                    onClose={() => setMostrarModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}