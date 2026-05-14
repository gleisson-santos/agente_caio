import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Settings, MessageSquare, Activity, Layers,
  PanelLeftClose, PanelLeftOpen, Plus, MoreHorizontal, 
  Pin, Trash2, Pencil, Check, X, Shield, Globe, 
  Mail, Calendar, Workflow, Sparkles
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
    { id: 'chat',     label: 'Mensagens',       icon: MessageSquare },
    { id: 'monitor',  label: 'Sistema',         icon: Activity },
    { id: 'agents',   label: 'Habilidades',     icon: Layers },
    { id: 'settings', label: 'Preferências',    icon: Settings },
  ];

  const availableSkills = [
    { id: 'filesystem', label: 'Arquivos', icon: Shield, color: 'text-zinc-700', desc: 'Leitura e escrita segura em Sandbox.' },
    { id: 'search', label: 'Web Search', icon: Globe, color: 'text-zinc-700', desc: 'Busca em tempo real via Brave.' },
    { id: 'email', label: 'E-mail', icon: Mail, color: 'text-zinc-700', desc: 'Gestão de comunicações IMAP/SMTP.' },
    { id: 'calendar', label: 'Calendário', icon: Calendar, color: 'text-zinc-700', desc: 'Orquestração de eventos Google.' },
    { id: 'workflow', label: 'Automação', icon: Workflow, color: 'text-zinc-700', desc: 'Execução de tarefas complexas.' },
    { id: 'mcp', label: 'Model Protocol', icon: Sparkles, color: 'text-zinc-700', desc: 'Integração de ferramentas externas.' },
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
    <div className="flex h-screen bg-white text-zinc-900 overflow-hidden font-sans antialiased">
      
      {/* ── Arsenal Command Modal ───────────────────────── */}
      <AnimatePresence>
        {isSkillModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-zinc-200"
            >
              <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Capacidades do Agente</h2>
                  <p className="text-xs text-zinc-500">Ative os módulos para esta operação.</p>
                </div>
                <button onClick={() => setIsSkillModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"><X className="w-5 h-5 text-zinc-400" /></button>
              </div>
              <div className="p-6 grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {availableSkills.map(skill => {
                  const isActive = activeSession?.enabledSkills?.includes(skill.id);
                  const Icon = skill.icon;
                  return (
                    <button 
                      key={skill.id}
                      onClick={() => toggleSkill(activeSessionId, skill.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                        isActive 
                          ? "bg-zinc-900 border-zinc-900 text-white shadow-lg" 
                          : "bg-white border-zinc-100 hover:border-zinc-300"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg", isActive ? "bg-white/10" : "bg-zinc-100")}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{skill.label}</p>
                        <p className={cn("text-[11px] mt-0.5", isActive ? "text-zinc-400" : "text-zinc-500")}>{skill.desc}</p>
                      </div>
                      <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center transition-all", isActive ? "bg-white border-white text-zinc-900" : "border-zinc-200")}>
                        {isActive && <Check className="w-3 h-3" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <button onClick={() => setIsSkillModalOpen(false)} className="px-5 py-2 bg-zinc-900 text-white rounded-lg font-bold text-xs hover:bg-zinc-800 transition-all">
                  Concluído
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
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full bg-[#FAFAFA] overflow-hidden shrink-0 border-r border-zinc-200/60"
          >
            <div className="flex flex-col h-full w-[280px]">
              {/* Header Actions */}
              <div className="h-14 flex items-center justify-between px-4 shrink-0 mt-1">
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-zinc-200/50">
                  <PanelLeftClose className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => setIsSkillModalOpen(true)} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-zinc-200/50" title="Gerenciar Habilidades">
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button onClick={handleNewChat} className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-900 hover:border-zinc-900 transition-all shadow-sm active:scale-95" title="Novo Chat">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Primary Nav */}
              <nav className="px-3 space-y-0.5 mt-2 shrink-0">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all",
                        isActive
                          ? "bg-white text-zinc-900 font-bold shadow-sm ring-1 ring-zinc-200"
                          : "text-zinc-500 hover:text-zinc-900 hover:bg-white/60 font-medium"
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5", isActive ? "text-zinc-900" : "")} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Chat Channels Section */}
              <div className="flex-1 overflow-y-auto custom-scrollbar mt-6 px-3 pb-6 relative">
                <div className="mb-2 px-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recentes</span>
                </div>
                <div className="space-y-0.5">
                  {sortedSessions.map(s => {
                    const isActive = activeSessionId === s.id && currentPage === 'chat';
                    const isEditing = editingSessionId === s.id;

                    return (
                      <div 
                        key={s.id} 
                        className={cn(
                          "group relative flex items-center w-full rounded-lg text-[13px] transition-all px-1",
                          isActive
                            ? "bg-white text-zinc-900 font-bold shadow-sm ring-1 ring-zinc-200"
                            : "text-zinc-500 hover:text-zinc-900 hover:bg-white/80"
                        )}
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1 w-full px-1 py-1.5">
                            <input autoFocus className="bg-zinc-100 border-none rounded px-2 py-1 w-full text-xs font-medium outline-none focus:ring-1 focus:ring-zinc-300" value={editTitle} onChange={e => setEditTitle(e.target.value)} onKeyDown={e => { if(e.key==='Enter') saveEdit(); if(e.key==='Escape') setEditingSessionId(null); }} />
                            <button onClick={saveEdit} className="p-1 text-zinc-900"><Check className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => handleSelectSession(s.id)} className="flex-1 text-left px-2.5 py-2 truncate">
                              <span className="flex items-center gap-2">
                                {s.pinned ? <Pin className="w-3 h-3 text-zinc-900 fill-zinc-900" /> : <div className="w-1 h-1 rounded-full bg-zinc-300 group-hover:bg-zinc-400" />}
                                <span className="truncate">{s.title}</span>
                              </span>
                            </button>
                            
                            <div className={cn("flex items-center opacity-0 group-hover:opacity-100 transition-opacity px-1", menuOpenId === s.id ? 'opacity-100' : '')}>
                              <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === s.id ? null : s.id); }} className="p-1 rounded-md hover:bg-zinc-100 text-zinc-400">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {menuOpenId === s.id && (
                              <div ref={menuRef} className="absolute left-6 top-8 z-[100] w-40 bg-white rounded-xl shadow-2xl border border-zinc-200 py-1.5 overflow-hidden animate-in">
                                <button onClick={() => handleTogglePin(s.id)} className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-50 transition-colors">
                                  <Pin className="w-3.5 h-3.5" /> {s.pinned ? 'Desafixar' : 'Fixar'}
                                </button>
                                <button onClick={() => startEditing(s)} className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-50 transition-colors">
                                  <Pencil className="w-3.5 h-3.5" /> Renomear
                                </button>
                                <div className="h-px bg-zinc-100 my-1" />
                                <button onClick={() => handleDeleteSession(s.id)} className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] font-bold text-red-500 hover:bg-red-50 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" /> Excluir
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

              {/* Bottom Profile */}
              <div className="p-4 shrink-0 bg-white/40">
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white transition-all cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                    GS
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] text-zinc-900 font-bold truncate leading-none">Gleisson Santos</span>
                    <span className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-tighter">Caio Engine v5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main Canvas ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative bg-white">
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

        {/* Sidebar Toggle (Floating) */}
        {!isSidebarOpen && (
          <div className="absolute top-4 left-4 z-50">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 rounded-lg bg-white text-zinc-400 hover:text-zinc-900 shadow-sm border border-zinc-200 transition-all">
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage === 'chat' ? `chat-${activeSessionId}` : currentPage}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 w-full h-full overflow-hidden flex flex-col"
          >
            {currentPage === 'chat' && (
              <AnimatedAIChat 
                key={activeSessionId}
                sessionId={activeSessionId} 
                onChatUpdate={onChatUpdate}
              />
            )}
            {currentPage !== 'chat' && (
               <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
                  <div className="max-w-4xl mx-auto">
                    {currentPage === 'monitor' && <MonitorPage />}
                    {currentPage === 'agents' && <AgentsPage />}
                    {currentPage === 'settings' && <CoreSettings />}
                  </div>
               </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
