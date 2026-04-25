import React, { useState, Suspense } from 'react';
import { Network, Search, Bot, Database, Globe, Wrench, Cpu, Mail, Calendar, Shield, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Agent cards data ──────────────────────────────────────────── */
const agentCards = [
  { name: 'CaioCore (CEO)', desc: 'Coordenador Central — Orquestra todos os especialistas, delega tarefas e centraliza notificações.', status: 'online', icon: <Cpu className="w-5 h-5" />, color: 'violet' },
  { name: 'Especialista Código', desc: 'Gera, debugga e refatora código em Python, TypeScript, SQL e mais.', status: 'online', icon: <Zap className="w-5 h-5" />, color: 'blue' },
  { name: 'Especialista Web', desc: 'Pesquisa e extrai dados de qualquer URL ou API pública.', status: 'online', icon: <Globe className="w-5 h-5" />, color: 'cyan' },
  { name: 'Especialista BD', desc: 'Gerencia DDL/DML, Supabase, PGVector e backups.', status: 'online', icon: <Database className="w-5 h-5" />, color: 'emerald' },
  { name: 'E-mail Monitor', desc: 'Monitora caixa IMAP e gera resumos automáticos.', status: 'offline', icon: <Mail className="w-5 h-5" />, color: 'amber' },
  { name: 'Google Calendar', desc: 'Cria eventos, consulta agenda e gerencia lembretes.', status: 'online', icon: <Calendar className="w-5 h-5" />, color: 'rose' },
  { name: 'Segurança & Auth', desc: 'Gerencia tokens OAuth, credenciais e permissões de acesso.', status: 'online', icon: <Shield className="w-5 h-5" />, color: 'indigo' },
  { name: 'Ferramentas CLI', desc: 'Executa comandos shell, scripts e automações no servidor.', status: 'online', icon: <Wrench className="w-5 h-5" />, color: 'orange' },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  violet:  { bg: 'bg-violet-500/15',  text: 'text-violet-400',  border: 'border-violet-500/30' },
  blue:    { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/30' },
  cyan:    { bg: 'bg-cyan-500/15',    text: 'text-cyan-400',    border: 'border-cyan-500/30' },
  emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  amber:   { bg: 'bg-amber-500/15',   text: 'text-amber-400',  border: 'border-amber-500/30' },
  rose:    { bg: 'bg-rose-500/15',    text: 'text-rose-400',    border: 'border-rose-500/30' },
  indigo:  { bg: 'bg-indigo-500/15',  text: 'text-indigo-400',  border: 'border-indigo-500/30' },
  orange:  { bg: 'bg-orange-500/15',  text: 'text-orange-400',  border: 'border-orange-500/30' },
};

/* ── Lazy Neural Graph ─────────────────────────────────────────── */
const NeuralGraphLazy = React.lazy(() => import('../components/graph/NeuralGraph'));

/* ── Main Component ────────────────────────────────────────────── */
export default function AgentsPage() {
  const [view, setView] = useState<'grid' | 'graph'>('grid');
  const [search, setSearch] = useState('');

  const filtered = agentCards.filter(
    a => a.name.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">
            Ecossistema Neural
          </h1>
          <p className="text-white/40 text-sm mt-1">Visualize e gerencie os especialistas e ferramentas do Agente Caio.</p>
        </div>

        <div className="flex items-center gap-3">
          {view === 'grid' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filtrar..."
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-violet-500/50 w-48"
              />
            </div>
          )}
          <div className="flex bg-white/5 rounded-lg border border-white/10 p-1">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                view === 'grid' ? 'bg-violet-600/50 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bot className="w-3.5 h-3.5" /> Cards
            </button>
            <button
              onClick={() => setView('graph')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                view === 'graph' ? 'bg-violet-600/50 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Network className="w-3.5 h-3.5" /> Graph
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
          >
            {filtered.map((agt, i) => {
              const c = colorMap[agt.color] || colorMap.violet;
              return (
                <motion.div
                  key={agt.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                  className="group bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer hover:border-white/[0.12]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${c.bg} ${c.text} border ${c.border}`}>
                      {agt.icon}
                    </div>
                    <span className={`text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-full border ${
                      agt.status === 'online'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {agt.status === 'online' ? '● ONLINE' : '○ OFFLINE'}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white/90 group-hover:text-white transition-colors">{agt.name}</h3>
                  <p className="text-white/40 text-xs mt-2 leading-relaxed">{agt.desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-xs text-white/20 group-hover:text-white/40 transition-colors">
                    <span>Ver detalhes</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="graph"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 bg-black/30 border border-white/[0.06] rounded-2xl overflow-hidden min-h-[500px]"
          >
            <Suspense fallback={
              <div className="flex items-center justify-center h-full text-white/40 text-sm">
                Carregando Neural Graph...
              </div>
            }>
              <NeuralGraphLazy />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
