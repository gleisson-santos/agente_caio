import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Settings, MessageSquare, Activity, Layers,
  PanelLeftClose, PanelLeftOpen, Plus, ChevronDown, SquarePen,
  MoreHorizontal, Pin, Trash2, Pencil, Check, X, Shield, Globe, Mail, Calendar, Workflow, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CoreSettings from './pages/CoreSettings';
import MonitorPage from './pages/MonitorPage';
import { AnimatedAIChat } from './components/ui/animated-ai-chat';
import AgentsPage from './pages/AgentsPage';
import ArtifactCanvas from './components/ui/artifact-canvas';
import { cn } from './lib/utils';

/* ── Chat session helpers ──────────────────────────────────────── */
interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: number;
  pinned?: boolean;
  enabledSkills?: string[];
}

function loadSessions(): ChatSession[] {
  try { return JSON.parse(localStorage.getItem('caio_sessions') || '[]'); } catch { return []; }
}
function saveSessions(s: ChatSession[]) { localStorage.setItem('caio_sessions', JSON.stringify(s)); }
function createSessionId() { return `chat-${Date.now()}`; }

function updateSessionInList(sessions: ChatSession[], id: string, firstMsg: string): ChatSession[] {
  const title = firstMsg.slice(0, 40) + (firstMsg.length > 40 ? '...' : '');
  const exists = sessions.find(s => s.id === id);
  if (exists) {
    return sessions.map(s => s.id === id ? { ...s, lastMessage: firstMsg, updatedAt: Date.now() } : s);
  }
  return [{ id, title, lastMessage: firstMsg, updatedAt: Date.now(), enabledSkills: [] }, ...sessions].slice(0, 30);
}

/* ── App ───────────────────────────────────────────────────────── */
function App() {
  const [currentPage, setCurrentPage] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeArtifact, setActiveArtifact] = useState<{type: 'code' | 'markdown' | 'image', title: string, content: string} | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const s = loadSessions();
    return s.length > 0 ? s[0].id : createSessionId();
  });
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'chat',     label: 'Operações',       icon: MessageSquare },
    { id: 'monitor',  label: 'Monitoramento',   icon: Activity },
    { id: 'agents',   label: 'Especialistas',   icon: Layers },
    { id: 'settings', label: 'Configurações',   icon: Settings },
  ];

  const availableSkills = [
    { id: 'filesystem', label: 'Arquivos', icon: Shield, color: 'text-emerald-500', desc: 'Leitura, escrita e edição em Sandbox.' },
    { id: 'search', label: 'Deep Search', icon: Globe, color: 'text-blue-500', desc: 'Busca web via Brave API.' },
    { id: 'email', label: 'Sentinel Mail', icon: Mail, color: 'text-amber-500', desc: 'Gestão de IMAP/SMTP.' },
    { id: 'calendar', label: 'Agenda', icon: Calendar, color: 'text-violet-500', desc: 'Orquestração de compromissos.' },
    { id: 'workflow', label: 'Automação', icon: Workflow, color: 'text-pink-500', desc: 'Execução de receitas táticas.' },
    { id: 'mcp', label: 'MCP Host', icon: Sparkles, color: 'text-indigo-500', desc: 'Integração universal de ferramentas.' },
  ];

  useEffect(() => { saveSessions(sessions); }, [sessions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onChatUpdate = useCallback((sessionId: string, firstMessage: string) => {
    setSessions(prev => updateSessionInList(prev, sessionId, firstMessage));
  }, []);

  const handleNewChat = () => {
    const id = createSessionId();
    setActiveSessionId(id);
    setCurrentPage('chat');
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setCurrentPage('chat');
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      setActiveSessionId(updated.length > 0 ? updated[0].id : createSessionId());
    }
    setMenuOpenId(null);
  };

  const handleTogglePin = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s));
    setMenuOpenId(null);
  };

  const startEditing = (s: ChatSession) => {
    setEditingSessionId(s.id);
    setEditTitle(s.title);
    setMenuOpenId(null);
  };

  const saveEdit = () => {
    if (editingSessionId && editTitle.trim()) {
      setSessions(prev => prev.map(s => s.id === editingSessionId ? { ...s, title: editTitle.trim() } : s));
    }
    setEditingSessionId(null);
  };

  const toggleSkill = (sessionId: string, skillId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const skills = s.enabledSkills || [];
      return {
        ...s,
        enabledSkills: skills.includes(skillId) 
          ? skills.filter(id => id !== skillId) 
          : [...skills, skillId]
      };
    }));
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="flex h-screen bg-white text-foreground overflow-hidden font-sans selection:bg-violet-100 selection:text-violet-900">
      
      {/* ── Skill Command Center Modal ──────────────────── */}
      <AnimatePresence>
        {isSkillModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-zinc-100"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 text-foreground">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-violet-500" />
                    Arsenal de Poderes
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1 font-medium">Configure as capacidades neurais do Agente Caio para esta operação.</p>
                </div>
                <button onClick={() => setIsSkillModalOpen(false)} className="p-3 hover:bg-zinc-100 rounded-2xl transition-all active:scale-95"><X className="w-6 h-6 text-zinc-400" /></button>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[55vh] overflow-y-auto custom-scrollbar">
                {availableSkills.map(skill => {
                  const isActive = activeSession?.enabledSkills?.includes(skill.id);
                  const Icon = skill.icon;
                  return (
                    <button 
                      key={skill.id}
                      onClick={() => toggleSkill(activeSessionId, skill.id)}
                      className={cn(
                        "flex items-start gap-5 p-5 rounded-[24px] border transition-all text-left relative",
                        isActive 
                          ? "bg-white border-violet-500 shadow-xl shadow-violet-100 ring-4 ring-violet-50" 
                          : "bg-zinc-50/50 border-transparent hover:border-zinc-200"
                      )}
                    >
                      <div className={cn("p-3.5 rounded-2xl transition-all", isActive ? "bg-violet-600 text-white shadow-lg shadow-violet-200" : "bg-white shadow-sm text-zinc-400")}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <p className={cn("text-[15px] font-bold mb-1", isActive ? "text-violet-900" : "text-zinc-700")}>{skill.label}</p>
                        <p className="text-[12px] text-zinc-400 leading-snug font-medium line-clamp-2">{skill.desc}</p>
                      </div>
                      <div className={cn("absolute right-5 top-5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300", isActive ? "bg-violet-600 border-violet-600 scale-110" : "border-zinc-200")}>
                        {isActive && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                <button onClick={() => setIsSkillModalOpen(false)} className="px-8 py-3.5 bg-zinc-900 text-white rounded-2xl font-black text-sm hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95">
                  Confirmar Configuração
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sidebar ──────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full bg-[#F9F9FB] overflow-hidden shrink-0 border-r border-zinc-100"
          >
            <div className="flex flex-col h-full w-[320px]">
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-6 shrink-0 mt-2">
                <button onClick={() => setIsSidebarOpen(false)} className="p-2.5 rounded-2xl text-zinc-400 hover:text-zinc-700 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-zinc-200/50">
                  <PanelLeftClose className="w-[20px] h-[20px]" />
                </button>
                <button onClick={handleNewChat} className="p-2.5 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-700 transition-all shadow-lg shadow-zinc-200 active:scale-95" title="Novo chat">
                  <Plus className="w-[20px] h-[20px]" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="px-4 space-y-1.5 mt-4 shrink-0">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] transition-all duration-200 ${
                        isActive
                          ? 'bg-white text-foreground font-black shadow-md border border-zinc-100'
                          : 'text-zinc-500 hover:text-foreground hover:bg-white/60 font-medium'
                      }`}
                    >
                      <Icon className={cn("w-[18px] h-[18px]", isActive ? "text-violet-500" : "")} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Skill Control Center Entry */}
              <div className="mt-8 px-6">
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-5 rounded-[24px] shadow-xl shadow-violet-100 relative overflow-hidden group">
                   <div className="relative z-10">
                     <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Módulos de IA</p>
                     <h4 className="text-white font-bold text-[15px] mb-4">Gerenciar Habilidades</h4>
                     <button 
                       onClick={() => setIsSkillModalOpen(true)}
                       className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[12px] font-bold py-2.5 rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2"
                     >
                       <Sparkles className="w-3.5 h-3.5" />
                       Abrir Arsenal
                     </button>
                   </div>
                   <Sparkles className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12 group-hover:scale-110 transition-transform" />
                </div>
              </div>

              {/* Chat Sessions */}
              <div className="flex-1 overflow-y-auto custom-scrollbar mt-10 px-4 pb-6 relative">
                {sortedSessions.length > 0 && (
                  <div className="mb-3 px-3 flex items-center justify-between">
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Canais Recentes</span>
                  </div>
                )}
                <div className="space-y-1.5">
                  {sortedSessions.map(s => {
                    const isActive = activeSessionId === s.id && currentPage === 'chat';
                    const isEditing = editingSessionId === s.id;

                    return (
                      <div 
                        key={s.id} 
                        className={cn(
                          "group relative flex items-center w-full rounded-2xl text-[14px] transition-all px-1.5",
                          isActive
                            ? "bg-white text-foreground font-bold shadow-md border border-zinc-100"
                            : "text-zinc-500 hover:text-foreground hover:bg-white/80"
                        )}
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2 w-full px-2 py-3">
                            <input autoFocus className="bg-zinc-100 border-none rounded-xl px-3 py-1.5 w-full text-xs font-medium focus:ring-2 focus:ring-violet-200 outline-none" value={editTitle} onChange={e => setEditTitle(e.target.value)} onKeyDown={e => { if(e.key==='Enter') saveEdit(); if(e.key==='Escape') setEditingSessionId(null); }} />
                            <button onClick={saveEdit} className="p-2 bg-green-50 text-green-600 rounded-lg"><Check className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => handleSelectSession(s.id)} className="flex-1 text-left px-3 py-3.5 truncate">
                              <span className="flex items-center gap-2.5">
                                {s.pinned ? <Pin className="w-3.5 h-3.5 text-violet-500 fill-violet-500" /> : <div className="w-2 h-2 rounded-full bg-zinc-200 group-hover:bg-violet-400" />}
                                <span className="truncate">{s.title}</span>
                              </span>
                            </button>
                            
                            <div className={cn("flex items-center px-1 pr-2 transition-opacity", menuOpenId === s.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
                              <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === s.id ? null : s.id); }} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                              </button>
                            </div>

                            {menuOpenId === s.id && (
                              <div ref={menuRef} className="absolute left-[calc(100%-60px)] top-12 z-[100] w-44 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-zinc-100 py-2 overflow-hidden animate-in zoom-in-95 duration-200">
                                <button onClick={() => handleTogglePin(s.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
                                  <Pin className="w-4 h-4" /> {s.pinned ? 'Desafixar' : 'Fixar'}
                                </button>
                                <button onClick={() => startEditing(s)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
                                  <Pencil className="w-4 h-4" /> Renomear
                                </button>
                                <div className="h-px bg-zinc-50 my-1.5" />
                                <button onClick={() => handleDeleteSession(s.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors">
                                  <Trash2 className="w-4 h-4" /> Excluir Chat
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* User Identity */}
              <div className="p-6 shrink-0 border-t border-zinc-100 bg-white/40">
                <div className="flex items-center gap-4 px-1 group cursor-pointer">
                  <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center text-white text-[12px] font-black shadow-xl shadow-violet-200 group-hover:scale-105 transition-transform">
                    GS
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] text-zinc-900 font-black truncate leading-none mb-1">Gleisson Santos</span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Operador Soberano</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative bg-[#FFFFFF]">
        <AnimatePresence>
          {activeArtifact && (
            <ArtifactCanvas 
              type={activeArtifact.type} 
              title={activeArtifact.title} 
              content={activeArtifact.content} 
              onClose={() => setActiveArtifact(null)} 
            />
          )}
        </AnimatePresence>

        {/* Collapsed toggle */}
        {!isSidebarOpen && (
          <div className="absolute top-5 left-5 z-50">
            <button onClick={() => setIsSidebarOpen(true)} className="p-3 rounded-2xl bg-white text-zinc-400 hover:text-zinc-800 shadow-xl border border-zinc-100 transition-all hover:scale-105 active:scale-95">
              <PanelLeftOpen className="w-[20px] h-[20px]" />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage === 'chat' ? `chat-${activeSessionId}` : currentPage}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full h-full overflow-hidden"
          >
            {currentPage === 'chat' && (
              <AnimatedAIChat 
                key={activeSessionId}
                sessionId={activeSessionId} 
                onChatUpdate={onChatUpdate}
              />
            )}
            {currentPage === 'monitor' && (
              <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
                <div className="max-w-6xl mx-auto"><MonitorPage /></div>
              </div>
            )}
            {currentPage === 'agents' && (
              <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
                <div className="max-w-6xl mx-auto"><AgentsPage /></div>
              </div>
            )}
            {currentPage === 'settings' && (
              <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
                <div className="max-w-3xl mx-auto"><CoreSettings /></div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
    <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
                <div className="max-w-6xl mx-auto"><AgentsPage /></div>
              </div>
            )}
            {currentPage === 'settings' && (
              <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
                <div className="max-w-3xl mx-auto"><CoreSettings /></div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
