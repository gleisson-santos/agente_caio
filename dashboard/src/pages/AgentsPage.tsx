import React, { useState, useEffect } from 'react';
import { Network, Search, Bot, Database, Globe, Wrench, Cpu, Mail, Calendar, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const getNodeStyle = (type: string) => {
  switch (type) {
    case 'core':
      return {
        background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
        border: '2px solid #a78bfa',
        color: '#fff',
        borderRadius: '12px',
        padding: '12px 20px',
        fontSize: '13px',
        fontWeight: 600,
        boxShadow: '0 0 24px rgba(139, 92, 246, 0.3)',
      };
    case 'specialist':
      return {
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        border: '1px solid #6366f1',
        color: '#e0e7ff',
        borderRadius: '10px',
        padding: '10px 16px',
        fontSize: '12px',
        fontWeight: 500,
      };
    case 'tool':
      return {
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        border: '1px solid #34d399',
        color: '#d1fae5',
        borderRadius: '10px',
        padding: '10px 16px',
        fontSize: '12px',
        fontWeight: 500,
      };
    default:
      return {
        background: '#1f2937',
        border: '1px solid #4b5563',
        color: '#d1d5db',
        borderRadius: '10px',
        padding: '10px 16px',
        fontSize: '12px',
      };
  }
};

const agentCards = [
  { name: 'CaioCore', desc: 'Coordenador Central — Orquestra todos os especialistas e tools.', status: 'online', icon: <Cpu className="w-5 h-5" />, color: 'violet' },
  { name: 'Especialista Código', desc: 'Gera, debugga e refatora código em múltiplas linguagens.', status: 'online', icon: <Zap className="w-5 h-5" />, color: 'blue' },
  { name: 'Especialista Web', desc: 'Pesquisa e extrai dados de qualquer URL ou API pública.', status: 'online', icon: <Globe className="w-5 h-5" />, color: 'cyan' },
  { name: 'Especialista Banco de Dados', desc: 'Gerencia DDL/DML, Supabase, PGVector e backups.', status: 'online', icon: <Database className="w-5 h-5" />, color: 'emerald' },
  { name: 'Especialista E-mail', desc: 'Monitora caixa de entrada IMAP e gera resumos automáticos.', status: 'offline', icon: <Mail className="w-5 h-5" />, color: 'amber' },
  { name: 'Google Calendar', desc: 'Cria eventos, consulta agenda e gerencia lembretes.', status: 'online', icon: <Calendar className="w-5 h-5" />, color: 'rose' },
  { name: 'Segurança & Auth', desc: 'Gerencia tokens OAuth, credenciais e permissões.', status: 'online', icon: <Shield className="w-5 h-5" />, color: 'indigo' },
  { name: 'Ferramentas CLI', desc: 'Executa comandos shell, scripts e automações no servidor.', status: 'online', icon: <Wrench className="w-5 h-5" />, color: 'orange' },
];

const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  violet: { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30', glow: 'shadow-violet-500/10' },
  blue: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/10' },
  cyan: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/10' },
  emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/10' },
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-amber-500/10' },
  rose: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', glow: 'shadow-rose-500/10' },
  indigo: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30', glow: 'shadow-indigo-500/10' },
  orange: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', glow: 'shadow-orange-500/10' },
};

export default function AgentsPage() {
  const [view, setView] = useState<'grid' | 'graph'>('graph');
  const [search, setSearch] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const initialNodes = [
      { id: 'caio', position: { x: 400, y: 280 }, data: { label: '🧠 CAIO Core' }, style: getNodeStyle('core') },
      { id: 'code', position: { x: 120, y: 100 }, data: { label: '⚡ Especialista Código' }, style: getNodeStyle('specialist') },
      { id: 'web', position: { x: 680, y: 100 }, data: { label: '🌐 Especialista Web' }, style: getNodeStyle('specialist') },
      { id: 'db', position: { x: 120, y: 460 }, data: { label: '🗄️ Especialista BD' }, style: getNodeStyle('specialist') },
      { id: 'email', position: { x: 680, y: 460 }, data: { label: '📧 E-mail Monitor' }, style: getNodeStyle('specialist') },
      { id: 'calendar', position: { x: 400, y: 520 }, data: { label: '📅 Google Calendar' }, style: getNodeStyle('tool') },
      { id: 'search', position: { x: 900, y: 100 }, data: { label: '🔍 Web Search' }, style: getNodeStyle('tool') },
      { id: 'supabase', position: { x: -100, y: 460 }, data: { label: '🐘 Supabase / PGVector' }, style: getNodeStyle('tool') },
      { id: 'shell', position: { x: 400, y: 60 }, data: { label: '🖥️ Shell / CLI' }, style: getNodeStyle('tool') },
    ];

    const initialEdges = [
      { id: 'e1', source: 'caio', target: 'code', animated: true, style: { stroke: '#6366f1' }, markerEnd: { type: MarkerType.Arrow, color: '#6366f1' } },
      { id: 'e2', source: 'caio', target: 'web', animated: true, style: { stroke: '#6366f1' }, markerEnd: { type: MarkerType.Arrow, color: '#6366f1' } },
      { id: 'e3', source: 'caio', target: 'db', animated: true, style: { stroke: '#6366f1' }, markerEnd: { type: MarkerType.Arrow, color: '#6366f1' } },
      { id: 'e4', source: 'caio', target: 'email', animated: true, style: { stroke: '#6366f1' }, markerEnd: { type: MarkerType.Arrow, color: '#6366f1' } },
      { id: 'e5', source: 'caio', target: 'calendar', style: { stroke: '#34d399' }, markerEnd: { type: MarkerType.Arrow, color: '#34d399' } },
      { id: 'e6', source: 'caio', target: 'shell', style: { stroke: '#34d399' }, markerEnd: { type: MarkerType.Arrow, color: '#34d399' } },
      { id: 'e7', source: 'web', target: 'search', style: { stroke: '#34d399' }, markerEnd: { type: MarkerType.Arrow, color: '#34d399' } },
      { id: 'e8', source: 'db', target: 'supabase', style: { stroke: '#34d399' }, markerEnd: { type: MarkerType.Arrow, color: '#34d399' } },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  const filteredCards = agentCards.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">
            Ecossistema Neural
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Visualize e gerencie os especialistas e ferramentas do Agente Caio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          {view === 'grid' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar especialistas..."
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-violet-500/50 w-56"
              />
            </div>
          )}

          {/* View Toggle */}
          <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-1">
            <button
              onClick={() => setView('graph')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                view === 'graph'
                  ? 'bg-violet-600/50 text-white shadow-lg shadow-violet-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              Graph
            </button>
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                view === 'grid'
                  ? 'bg-violet-600/50 text-white shadow-lg shadow-violet-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-black/30 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden relative shadow-2xl min-h-[500px]">
        <AnimatePresence mode="wait">
          {view === 'graph' ? (
            <motion.div
              key="graph"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                className="bg-[#050508]"
                proOptions={{ hideAttribution: true }}
              >
                <Controls
                  className="!bg-white/5 !border !border-white/10 !rounded-lg !shadow-xl [&>button]:!bg-white/5 [&>button]:!border-white/10 [&>button]:!fill-white/60 [&>button:hover]:!bg-white/10"
                />
                <MiniMap
                  nodeColor="#7c3aed"
                  maskColor="rgba(0, 0, 0, 0.8)"
                  className="!bg-black/60 !border !border-white/10 !rounded-lg"
                />
                <Background gap={20} size={1} color="rgba(255, 255, 255, 0.03)" variant={BackgroundVariant.Dots} />
              </ReactFlow>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 h-full overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredCards.map((agt, i) => {
                  const colors = colorMap[agt.color] || colorMap.violet;
                  return (
                    <motion.div
                      key={agt.name}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
                      className={`group relative bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer hover:shadow-xl ${colors.glow} hover:border-white/[0.12]`}
                    >
                      {/* Glow accent */}
                      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${colors.bg} blur-xl -z-10`} />

                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.text} border ${colors.border}`}>
                          {agt.icon}
                        </div>
                        <span
                          className={`text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-full border ${
                            agt.status === 'online'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}
                        >
                          {agt.status === 'online' ? '● ONLINE' : '○ OFFLINE'}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-white/90 group-hover:text-white transition-colors">
                        {agt.name}
                      </h3>
                      <p className="text-white/40 text-xs mt-2 leading-relaxed">{agt.desc}</p>

                      {/* Bottom accent line */}
                      <div className={`absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent ${colors.border} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
