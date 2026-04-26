import React, { useState, Suspense } from 'react';
import { Search, Database, Globe, Wrench, Cpu, Mail, Calendar, Shield, Zap, ChevronRight, LayoutGrid, Share2, Activity, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const agents = [
  { id: 'ceo',   name: 'CaioCore',           role: 'Orquestrador',    desc: 'Coordena todos os especialistas e centraliza notificações.', status: 'online', icon: Cpu,      color: 'bg-violet-50 text-violet-500' },
  { id: 'code',  name: 'Código',              role: 'Desenvolvedor',   desc: 'Gera, debugga e refatora código em Python, TypeScript, SQL.', status: 'online', icon: Zap,      color: 'bg-blue-50 text-blue-500' },
  { id: 'web',   name: 'Web Research',        role: 'Pesquisador',     desc: 'Pesquisa e extrai dados de qualquer URL ou API pública.', status: 'online', icon: Globe,    color: 'bg-sky-50 text-sky-500' },
  { id: 'db',    name: 'Banco de Dados',      role: 'DBA',             desc: 'Gerencia DDL/DML, Supabase, PGVector e backups.', status: 'online', icon: Database,  color: 'bg-emerald-50 text-emerald-500' },
  { id: 'email', name: 'E-mail',              role: 'Comunicação',     desc: 'Monitora caixa IMAP e gera resumos automáticos.', status: 'offline', icon: Mail,     color: 'bg-amber-50 text-amber-500' },
  { id: 'gcal',  name: 'Google Calendar',     role: 'Agenda',          desc: 'Cria eventos, consulta agenda e gerencia lembretes.', status: 'online', icon: Calendar,  color: 'bg-rose-50 text-rose-500' },
  { id: 'auth',  name: 'Segurança',           role: 'Auth & Security', desc: 'Gerencia tokens OAuth, credenciais e permissões.', status: 'online', icon: Shield,    color: 'bg-indigo-50 text-indigo-500' },
  { id: 'cli',   name: 'CLI Tools',           role: 'Automação',       desc: 'Executa comandos shell, scripts no servidor.', status: 'online', icon: Wrench,    color: 'bg-orange-50 text-orange-500' },
];

const NeuralGraphLazy = React.lazy(() => import('../components/graph/NeuralGraph'));

export default function AgentsPage() {
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const filtered = agents.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase()));
  const online = agents.filter(a => a.status === 'online').length;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Especialistas</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">{online} de {agents.length} módulos ativos</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
              className="pl-9 pr-3 py-1.5 rounded-xl bg-zinc-100 border-0 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-200 w-44 text-zinc-600 placeholder:text-zinc-300 transition-all" />
          </div>
          <div className="flex rounded-xl bg-zinc-100 p-0.5">
            <button onClick={() => setView('grid')} className={cn("p-1.5 rounded-[10px] transition-all", view==='grid'?"bg-white text-zinc-700 shadow-sm":"text-zinc-300 hover:text-zinc-500")}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setView('graph')} className={cn("p-1.5 rounded-[10px] transition-all", view==='graph'?"bg-white text-zinc-700 shadow-sm":"text-zinc-300 hover:text-zinc-500")}><Share2 className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'grid' ? (
          <motion.div key="grid" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.div key={a.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                  className="group p-4 rounded-2xl bg-zinc-50/60 hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200 cursor-default">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", a.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={cn("w-1.5 h-1.5 rounded-full", a.status==='online'?"bg-emerald-400":"bg-zinc-200")} />
                      <span className="text-[10px] text-zinc-300 font-medium">{a.status==='online'?'Online':'Off'}</span>
                    </div>
                  </div>
                  <h3 className="text-[14px] font-semibold text-zinc-800 mb-0.5 group-hover:text-violet-600 transition-colors">{a.name}</h3>
                  <p className="text-[11px] text-violet-500 font-medium mb-2">{a.role}</p>
                  <p className="text-[12px] text-zinc-400 leading-relaxed line-clamp-2 mb-3">{a.desc}</p>
                  <button className="text-[12px] font-medium text-zinc-300 group-hover:text-violet-500 flex items-center gap-0.5 transition-colors">
                    Abrir <ChevronRight className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="graph" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="rounded-2xl bg-zinc-50/60 overflow-hidden min-h-[500px] relative">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl shadow-sm">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-[11px] font-medium text-zinc-600">Grafo Neural</span>
            </div>
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>}>
              <NeuralGraphLazy />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
