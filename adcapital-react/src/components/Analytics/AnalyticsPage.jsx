import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import analyticsService from '../../api/analyticsService';
import StatusView from '../Common/StatusView';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage({ preloadedData }) {
  const [stats, setStats] = useState(preloadedData || null);
  const [loading, setLoading] = useState(!preloadedData);
  const [error, setError] = useState(null);

  const carregarDados = async () => {
    if (preloadedData && stats) return; // Se já temos dados, não recarrega sozinho
    setLoading(true);
    try {
      const data = await analyticsService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar estatísticas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!preloadedData) {
        carregarDados();
    }
  }, [preloadedData]);

  if (error) return <StatusView error={error} onRetry={carregarDados} />;
  if (loading || !stats) return <StatusView loading={true} />;

  // Processar histórico financeiro para o gráfico de linhas
  // O backend manda {name, tipo, valor}. Precisamos agrupar por mês {name, entrada, saida}
  const financeiroAgrupado = stats.historico_financeiro.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.name);
    if (existing) {
      existing[curr.tipo.toLowerCase()] = curr.valor;
    } else {
      acc.push({ 
        name: curr.name, 
        entrada: curr.tipo === 'ENTRADA' ? curr.valor : 0,
        saida: curr.tipo === 'SAIDA' ? curr.valor : 0 
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Inteligência de Dados</h1>
          <p className="text-slate-400 text-sm font-medium">
            Membros e finanças no sistema · Tráfego site/portal via API interna · GA4 em{' '}
            <a href="https://analytics.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline">
              analytics.google.com
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-6 justify-end items-center">
          <div className="text-center">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">Total Membros</span>
            <span className="text-2xl font-black text-slate-800">{stats.total_membros}</span>
          </div>
          <div className="hidden sm:block w-px h-10 bg-slate-100 self-center"></div>
          <div className="text-center">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Ativos (Ligados)</span>
            <span className="text-2xl font-black text-slate-800">{stats.membros_ativos}</span>
          </div>
          <div className="hidden sm:block w-px h-10 bg-slate-100 self-center"></div>
          <div className="text-center">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Acessos ao Site</span>
            <span className="text-2xl font-black text-slate-800">{stats.total_acessos_site || 0}</span>
          </div>
          <div className="hidden sm:block w-px h-10 bg-slate-100 self-center"></div>
          <div className="text-center">
            <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest block">Acessos ao Portal</span>
            <span className="text-2xl font-black text-slate-800">{stats.total_acessos_portal || 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Crescimento de Membros */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">📈 Crescimento de Membros</h3>
          <div className="h-64 min-h-[16rem] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <BarChart data={stats.crescimento_membros}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Novos Membros" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição Etária */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">👥 Distribuição Etária</h3>
          <div className="h-64 min-h-[16rem] w-full min-w-0 flex items-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <PieChart>
                <Pie
                  data={stats.distribuicao_etaria}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="quantidade"
                  nameKey="faixa"
                >
                  {stats.distribuicao_etaria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Histórico Financeiro */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm lg:col-span-2">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">💰 Saúde Financeira (Entradas vs Saídas)</h3>
          <div className="h-80 min-h-[20rem] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
              <AreaChart data={financeiroAgrupado}>
                <defs>
                  <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  formatter={(val) => `R$ ${val.toLocaleString('pt-BR')}`}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Area type="monotone" dataKey="entrada" stroke="#10b981" fillOpacity={1} fill="url(#colorEntrada)" name="Entradas" strokeWidth={3} />
                <Area type="monotone" dataKey="saida" stroke="#ef4444" fillOpacity={1} fill="url(#colorSaida)" name="Saídas" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Histórico de Acessos (Site vs Portal) */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm lg:col-span-2">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">📊 Tráfego Mensal (Site vs Portal do Membro)</h3>
          <div className="h-80 min-h-[20rem] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
              <AreaChart data={stats.historico_acessos || []}>
                <defs>
                  <linearGradient id="colorSite" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPortal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  formatter={(val) => [`${val.toLocaleString('pt-BR')} visitas`, '']}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Area type="monotone" dataKey="site" stroke="#6366f1" fillOpacity={1} fill="url(#colorSite)" name="Site Público" strokeWidth={3} />
                <Area type="monotone" dataKey="portal" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPortal)" name="Portal do Membro" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
