import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, MessageSquare, Activity, Layers,
  PanelLeftClose, PanelLeftOpen, Plus, ChevronDown, SquarePen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CoreSettings from './pages/CoreSettings';
import MonitorPage from './pages/MonitorPage';
import { AnimatedAIChat } from './components/ui/animated-ai-chat';
import AgentsPage from './pages/AgentsPage';

/* ── Chat session helpers ──────────────────────────────────────── */
interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: number;
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
  return [{ id, title, lastMessage: firstMsg, updatedAt: Date.now() }, ...sessions].slice(0, 30);
}

/* ── App ───────────────────────────────────────────────────────── */
function App() {
  const [currentPage, setCurrentPage] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const s = loadSessions();
    return s.length > 0 ? s[0].id : createSessionId();
  });

  const navItems = [
    { id: 'chat',     label: 'Chat',            icon: MessageSquare },
    { id: 'monitor',  label: 'Monitoramento',   icon: Activity },
    { id: 'agents',   label: 'Especialistas',   icon: Layers },
    { id: 'settings', label: 'Configurações',   icon: Settings },
  ];

  useEffect(() => { saveSessions(sessions); }, [sessions]);

  const onChatUpdate = useCallback((sessionId: string, firstMessage: string) => {
    setSessions(prev => {
      const updated = updateSessionInList(prev, sessionId, firstMessage);
      return updated;
    });
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

  return (
    <div className="flex h-screen bg-white text-foreground overflow-hidden">
      
      {/* ── Sidebar ──────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full bg-[#FAFAFA] overflow-hidden shrink-0"
          >
            <div className="flex flex-col h-full w-[260px]">
              {/* Top bar */}
              <div className="h-14 flex items-center justify-between px-3 shrink-0">
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-white transition-colors">
                  <PanelLeftClose className="w-[18px] h-[18px]" />
                </button>
                <button onClick={handleNewChat} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-white transition-colors" title="Novo chat">
                  <SquarePen className="w-[18px] h-[18px]" />
                </button>
              </div>

              {/* Nav */}
              <nav className="px-2 space-y-0.5 shrink-0">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors duration-100 ${
                        isActive
                          ? 'bg-white text-foreground font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                          : 'text-zinc-500 hover:text-foreground hover:bg-white/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Sessions */}
              <div className="flex-1 overflow-y-auto custom-scrollbar mt-5 px-2">
                {sessions.length > 0 && (
                  <div className="mb-1 px-2">
                    <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Recentes</span>
                  </div>
                )}
                {sessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSession(s.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors truncate mb-px ${
                      activeSessionId === s.id && currentPage === 'chat'
                        ? 'bg-white text-foreground font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                        : 'text-zinc-500 hover:text-foreground hover:bg-white/60'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              {/* User */}
              <div className="p-2 shrink-0">
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/60 transition-colors cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-semibold">
                    GS
                  </div>
                  <span className="text-[13px] text-zinc-600 font-medium flex-1 truncate">Gleisson Santos</span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative">
        {/* Collapsed toggle */}
        {!isSidebarOpen && (
          <div className="absolute top-3 left-3 z-50">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
              <PanelLeftOpen className="w-[18px] h-[18px]" />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage === 'chat' ? `chat-${activeSessionId}` : currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
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
