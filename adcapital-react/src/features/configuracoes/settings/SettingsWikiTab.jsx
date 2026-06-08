import React from 'react';
import { 
  BookOpen, 
  Info, 
  ShieldAlert, 
  Layers, 
  Save,
  ExternalLink
} from 'lucide-react';
import { TechItem, UrlItem, ServiceCard, DataCard, EnvItem } from './settingsUi';

export default function SettingsWikiTab() {
  return (
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
                <TechItem label="Frontend" value="React 19 + Vite + Tailwind + React Router 7" />
                <TechItem label="Backend" value="Django 6.0 (Python 3)" />
                <TechItem label="API" value="DRF + /api/v1/ (legado /api/ depreciado Dez/2026)" />
                <TechItem label="TypeScript" value="apiBase.ts + queryClient.ts (migração gradual)" />
                <TechItem label="CI" value="pytest-cov 35% + vitest + eslint + build" />
                <TechItem label="OpenAPI" value="drf-spectacular (Swagger + ReDoc)" />
                <TechItem label="Banco de Dados" value="PostgreSQL (Supabase)" />
                <TechItem label="Servidor Web" value="Gunicorn 25.1" />
                <TechItem label="Mídia/Fotos" value="Cloudinary (CDN)" />
                <TechItem label="E-mail" value="Resend API (HTTPS)" />
                <TechItem label="DNS/CDN" value="Cloudflare" />
                <TechItem label="Hospedagem" value="Render (Free Tier)" />
                <TechItem label="Domínio" value="Registro.br" />
                <TechItem label="PDF" value="ReportLab" />
                <TechItem label="Analytics" value="Google Analytics 4 (GA4)" />
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-md border border-slate-100 space-y-6">
             <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                <ExternalLink size={14} /> URLs do Sistema
             </h3>
             <div className="space-y-3">
                <UrlItem label="Site Institucional" url="adcapitaligreja.com.br" />
                <UrlItem label="Login / Sistema" url="sistema.adcapitaligreja.com.br/login" />
                <UrlItem label="Painel Admin" url="sistema.adcapitaligreja.com.br/admin/inicio" />
                <UrlItem label="Portal Membro" url="sistema.adcapitaligreja.com.br/portal/mensagens" />
                <UrlItem label="Auto-cadastro" url="cadastro.adcapitaligreja.com.br" />
                <UrlItem label="API v1" url="api.adcapitaligreja.com.br/api/v1/" />
                <UrlItem label="Swagger (docs)" url="api.adcapitaligreja.com.br/api/v1/docs/" />
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
             <ServiceCard name="Cron-Job.org" role="Keep-Alive + Aniversários" detail="A cada 10 min: GET /api/v1/configuracao-site/ — Diário: aniversários com X-Cron-Secret" url="cron-job.org/en/" color="orange" />
             <ServiceCard name="Cloudinary" role="Armazenamento de Mídia" detail="Fotos, galeria, termos LGPD (PDF)" url="console.cloudinary.com" color="blue" />
             <ServiceCard name="Resend" role="E-mail Transacional" detail="Domínio: adcapitaligreja.com.br | noreply@adcapitaligreja.com.br" url="resend.com" color="slate" />
             <ServiceCard name="GitHub" role="Repositório de Código" detail="igrejaadcapital/adcapital (main)" url="github.com/igrejaadcapital/adcapital" color="slate" />
             <ServiceCard name="Google" role="Calendar + Credenciais" detail="Sincronização de eventos via API" url="calendar.google.com" color="blue" />
             <ServiceCard name="Google Analytics" role="Estatísticas e BI" detail="Métricas de acesso e conversões do site e portal de membros" url="analytics.google.com" color="orange" />
          </div>
       </div>

       {/* Arquitetura */}
       <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-8">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Arquitetura do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100/50 space-y-4">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Frontend (adcapital-web)</h4>
                <div className="space-y-2 text-[10px] font-bold text-slate-600">
                   <p>• React 19 + Vite + React Router 7</p>
                   <p>• Rotas: /login, /admin/*, /portal/*, /cadastro</p>
                   <p>• JWT no localStorage + Axios (120s timeout)</p>
                   <p>• VITE_API_URL → /api/v1 em produção</p>
                </div>
             </div>
             <div className="p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50 space-y-4">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Backend (adcapital-api)</h4>
                <div className="space-y-2 text-[10px] font-bold text-slate-600">
                   <p>• Django 6 + DRF + Gunicorn (:10000)</p>
                   <p>• Apps: membros, financeiro, agenda, analytics</p>
                   <p>• membros/api/ + membros/services/ (Fase 1)</p>
                   <p>• Deploy automático na branch main</p>
                </div>
             </div>
             <div className="p-6 bg-violet-50/50 rounded-[2rem] border border-violet-100/50 space-y-4">
                <h4 className="text-[10px] font-black text-violet-600 uppercase tracking-widest">API REST</h4>
                <div className="space-y-2 text-[10px] font-bold text-slate-600">
                   <p>• Contrato: /api/v1/ (recomendado)</p>
                   <p>• Legado: /api/ (header Deprecation; evitar)</p>
                   <p>• HashRouter em produção, BrowserRouter em dev</p>
                   <p>• Docs: /api/v1/docs/ e /redoc/</p>
                   <p>• JWT 30 min + refresh 7d + blacklist</p>
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
             <EnvItem name="DATABASE_URL" desc="PostgreSQL Supabase (API)" />
             <EnvItem name="SECRET_KEY" desc="Chave Django — obrigatória em produção" />
             <EnvItem name="CRON_SECRET" desc="Header X-Cron-Secret (cron aniversários)" />
             <EnvItem name="DEBUG" desc="False em produção" />
             <EnvItem name="ALLOWED_HOSTS" desc="Domínios permitidos pela API" />
             <EnvItem name="VITE_API_URL" desc="Base da API no front (ex.: .../api/v1)" />
             <EnvItem name="VITE_GA_MEASUREMENT_ID" desc="Google Analytics 4 (adcapital-web)" />
             <EnvItem name="RESEND_API_KEY" desc="E-mail transacional Resend" />
             <EnvItem name="CLOUDINARY_*" desc="CLOUD_NAME, API_KEY, API_SECRET" />
             <EnvItem name="GOOGLE_CREDENTIALS_JSON" desc="Google Calendar (agenda)" />
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

       {/* Fases do projeto */}
       <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-4">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-600">Roadmap de Fases (0–6)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-bold text-slate-600">
             <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">0–4 Segurança, API, Front, Android, CI ✓</div>
             <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">5 Qualidade + LGPD ✓</div>
             <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">6 Refatoração + TS (em andamento)</div>
             <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">Docs: docs/README.md</div>
          </div>
       </div>

       {/* Cadastro admin + auditoria */}
       <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-6">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
             <ShieldAlert size={14} /> Cadastro Admin, Login e LGPD
          </h3>
          <div className="space-y-2 text-[10px] font-bold text-slate-600 leading-relaxed">
             <p>• Ao salvar membro no admin: cria <strong>User</strong> (CPF) + senha padrão <code>Adcapital</code> + 5 dígitos do CPF.</p>
             <p>• Termo LGPD (PDF) gerado automaticamente se o membro ainda não tiver documento.</p>
             <p>• Auto-cadastro público: DRF em <code>/api/v1/c/</code>; busca de parentes exige token após pergunta de segurança.</p>
             <p>• Termo em branco (impressão): botão na lista de membros ou <code>GET .../termo-lgpd-em-branco/</code>.</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl font-mono text-xs text-blue-300 space-y-1">
             <code>python manage.py auditar_acesso_lgpd</code>
             <code className="block opacity-80">python manage.py gerar_acessos_membros</code>
             <code className="block opacity-80">python manage.py gerar_termos_lgpd</code>
          </div>
       </div>

       {/* Alerta SSL */}
       <div className="bg-rose-50 rounded-[2.5rem] p-8 border border-rose-200 space-y-3">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-rose-700 flex items-center gap-2">
             <ShieldAlert size={14} /> SSL — cadastro.adcapitaligreja.com.br
          </h3>
          <p className="text-[10px] font-bold text-rose-800/80 leading-relaxed">
             Se o smoke test falhar com certificado expirado, renove o <strong>Universal SSL</strong> no Cloudflare
             (zona adcapitaligreja.com.br → SSL/TLS → Edge Certificates). Guia: <code>docs/SSL-CADASTRO.md</code>.
          </p>
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
             <p>• <strong>Cold Start:</strong> API Render Free dorme após 15 min; Supabase pausa após 7 dias sem uso. <strong>cron-job.org</strong> chama <code>/api/v1/configuracao-site/</code> a cada 10 min.</p>
             <p>• <strong>Hashes antigos:</strong> <code>#/admin</code>, <code>#/portal</code> e <code>#/cadastro</code> redirecionam para as rotas novas do React Router.</p>
             <p>• <strong>Rollback:</strong> tag Git <code>prod-pre-fase1-20260522</code> (commit <code>def497c</code>). No Render: Manual Deploy nesse SHA. Ver <code>docs/ROLLBACK-FASE-1.md</code> e <code>ARQUITETURA.md</code> na raiz do repo.</p>
             <p>• <strong>Smoke pós-deploy:</strong> <code>python scripts/smoke_producao.py</code> ou <code>manage.py smoke_fase0</code>.</p>
             <p>• <strong>Deploy:</strong> push na <code>main</code> → build automático em adcapital-api e adcapital-web.</p>
             <p>• <strong>Manual completo:</strong> <code>ARQUITETURA.md</code> na raiz do repo; índice em <code>docs/README.md</code>.</p>
             <p>• <strong>Auditoria LGPD:</strong> rode <code>auditar_acesso_lgpd</code> após cadastros em lote no admin.</p>
             <p>• <strong>Legado removido:</strong> pasta <code>adcapitalapp/</code> e <code>view_public.py</code> (Fase 5).</p>
          </div>
       </div>
    </section>
  );
}
