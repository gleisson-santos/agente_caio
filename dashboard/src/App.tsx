import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Settings, MessageSquare, Activity, Layers,
  PanelLeftClose, PanelLeftOpen, Plus, ChevronDown, SquarePen,
  MoreHorizontal, Pin, Trash2, Pencil, Check, X, Shield, Globe, Mail, Calendar, Workflow
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CoreSettings from './pages/CoreSettings';
import MonitorPage from './pages/MonitorPage';
import { AnimatedAIChat } from './components/ui/animated-ai-chat';
import AgentsPage from './pages/AgentsPage';
import ArtifactCanvas from './components/ui/artifact-canvas';

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
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'chat',     label: 'Chat',            icon: MessageSquare },
    { id: 'monitor',  label: 'Monitoramento',   icon: Activity },
    { id: 'agents',   label: 'Especialistas',   icon: Layers },
    { id: 'settings', label: 'Configurações',   icon: Settings },
  ];

  const availableSkills = [
    { id: 'filesystem', label: 'Arquivos', icon: Shield, color: 'text-emerald-500' },
    { id: 'search', label: 'Pesquisa', icon: Globe, color: 'text-blue-500' },
    { id: 'email', label: 'E-mail', icon: Mail, color: 'text-amber-500' },
    { id: 'calendar', label: 'Agenda', icon: Calendar, color: 'text-violet-500' },
    { id: 'workflow', label: 'Automação', icon: Workflow, color: 'text-pink-500' },
  ];

  useEffect(() => { saveSessions(sessions); }, [sessions]);

  // Close menu on click outside
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
    <div className="flex h-screen bg-white text-foreground overflow-hidden font-sans">
      
      {/* ── Sidebar ──────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full bg-[#F9F9FB] overflow-hidden shrink-0 border-r border-zinc-100/80"
          >
            <div className="flex flex-col h-full w-[260px]">
              {/* Top bar */}
              <div className="h-14 flex items-center justify-between px-4 shrink-0">
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-zinc-200/50">
                  <PanelLeftClose className="w-[18px] h-[18px]" />
                </button>
                <button onClick={handleNewChat} className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-zinc-200/50" title="Novo chat">
                  <SquarePen className="w-[18px] h-[18px]" />
                </button>
              </div>

              {/* Nav */}
              <nav className="px-3 space-y-1 shrink-0">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] transition-all duration-200 ${
                        isActive
                          ? 'bg-white text-foreground font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100'
                          : 'text-zinc-500 hover:text-foreground hover:bg-white/60'
                      }`}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-violet-500" : "")} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Skill Selector (New!) */}
              <div className="mt-8 px-4">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] ml-1">Poderes Ativos</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableSkills.map(skill => {
                    const isActive = activeSession?.enabledSkills?.includes(skill.id);
                    const Icon = skill.icon;
                    return (
                      <button 
                        key={skill.id}
                        onClick={() => toggleSkill(activeSessionId, skill.id)}
                        title={skill.label}
                        className={cn(
                          "p-2 rounded-xl border transition-all duration-300",
                          isActive 
                            ? `bg-white border-zinc-200 shadow-md ${skill.color}` 
                            : "bg-zinc-50/50 border-transparent text-zinc-300 hover:border-zinc-200 hover:text-zinc-400"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sessions */}
              <div className="flex-1 overflow-y-auto custom-scrollbar mt-8 px-3 relative pb-4">
                {sortedSessions.length > 0 && (
                  <div className="mb-2 px-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Recentes</span>
                  </div>
                )}
                {sortedSessions.map(s => {
                  const isActive = activeSessionId === s.id && currentPage === 'chat';
                  const isEditing = editingSessionId === s.id;

                  return (
                    <div 
                      key={s.id} 
                      className={cn(
                        "group relative flex items-center w-full rounded-xl text-[13px] transition-all mb-1 px-1",
                        isActive
                          ? "bg-white text-foreground font-medium shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100"
                          : "text-zinc-500 hover:text-foreground hover:bg-white/60"
                      )}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1 w-full px-2 py-2">
                          <input 
                            autoFocus
                            className="bg-zinc-100 border-none rounded-lg px-2 py-1 w-full text-xs focus:ring-2 focus:ring-violet-200 outline-none"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            onKeyDown={e => { if(e.key==='Enter') saveEdit(); if(e.key==='Escape') setEditingSessionId(null); }}
                          />
                          <button onClick={saveEdit} className="p-1 hover:text-green-600"><Check className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleSelectSession(s.id)}
                            className="flex-1 text-left px-3 py-2.5 truncate"
                          >
                            <span className="flex items-center gap-2">
                              {s.pinned && <Pin className="w-3 h-3 text-violet-500 fill-violet-500" />}
                              <span className="truncate">{s.title}</span>
                            </span>
                          </button>
                          
                          <div className={cn(
                            "flex items-center px-1 transition-opacity",
                            menuOpenId === s.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          )}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === s.id ? null : s.id); }}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>

                          {menuOpenId === s.id && (
                            <div 
                              ref={menuRef}
                              className="absolute left-[calc(100%-40px)] top-10 z-[100] w-36 bg-white rounded-2xl shadow-2xl border border-zinc-100 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                            >
                              <button onClick={() => handleTogglePin(s.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-zinc-600 hover:bg-zinc-50 transition-colors">
                                <Pin className="w-3.5 h-3.5" /> {s.pinned ? 'Desafixar' : 'Fixar'}
                              </button>
                              <button onClick={() => startEditing(s)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-zinc-600 hover:bg-zinc-50 transition-colors">
                                <Pencil className="w-3.5 h-3.5" /> Renomear
                              </button>
                              <div className="h-px bg-zinc-50 my-1" />
                              <button onClick={() => handleDeleteSession(s.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 transition-colors">
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

              {/* User */}
              <div className="p-4 shrink-0 border-t border-zinc-100/50">
                <div className="flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-white transition-all cursor-pointer group">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shadow-lg shadow-violet-200">
                    GS
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] text-zinc-700 font-bold truncate leading-none">Gleisson Santos</span>
                    <span className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-medium">Soberano v5.0</span>
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
          <div className="absolute top-4 left-4 z-50">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 rounded-xl bg-white text-zinc-400 hover:text-zinc-600 shadow-sm border border-zinc-100 transition-all hover:shadow-md">
              <PanelLeftOpen className="w-[18px] h-[18px]" />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage === 'chat' ? `chat-${activeSessionId}` : currentPage}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
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
