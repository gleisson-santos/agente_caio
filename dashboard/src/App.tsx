import React, { useState } from 'react';
import { Settings, BarChart2, MessageSquare, Menu, Settings2Icon, Activity } from 'lucide-react';
import SettingsPage from './pages/SettingsPage';
import MonitorPage from './pages/MonitorPage';
import { AnimatedAIChat } from './components/ui/animated-ai-chat';
import AgentsPage from './pages/AgentsPage';

function MainChatArea() {
  return (
    <div className="flex w-full h-full p-2 h-screen max-w-[100vw] overflow-hidden bg-black text-white relative">
      <div className="w-full max-w-5xl mx-auto flex flex-col relative h-full">
         <AnimatedAIChat />
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden selection:bg-violet-500/30">
      {/* Sidebar minimalista */}
      <div 
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-white/10 bg-[#0a0a0A] z-50`}
      >
        <div>
          <div className="h-16 flex items-center justify-center border-b border-white/10">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5 text-white/70" />
            </button>
          </div>
          
          <nav className="p-2 space-y-2 mt-4">
            <button
              onClick={() => setCurrentPage('chat')}
              className={`w-full flex items-center ${
                sidebarOpen ? 'justify-start px-4' : 'justify-center'
              } p-3 rounded-lg transition-colors ${
                currentPage === 'chat'
                  ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <MessageSquare className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="ml-3 font-medium text-sm">CaioCore</span>}
            </button>

            <button
              onClick={() => setCurrentPage('monitor')}
              className={`w-full flex items-center ${
                sidebarOpen ? 'justify-start px-4' : 'justify-center'
              } p-3 rounded-lg transition-colors ${
                currentPage === 'monitor'
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Activity className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="ml-3 font-medium text-sm">Monitor de Rede</span>}
            </button>

            <button
              onClick={() => setCurrentPage('agents')}
              className={`w-full flex items-center ${
                sidebarOpen ? 'justify-start px-4' : 'justify-center'
              } p-3 rounded-lg transition-colors ${
                currentPage === 'agents'
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <BarChart2 className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="ml-3 font-medium text-sm">Especialistas</span>}
            </button>

            <button
              onClick={() => setCurrentPage('settings')}
              className={`w-full flex items-center ${
                sidebarOpen ? 'justify-start px-4' : 'justify-center'
              } p-3 rounded-lg transition-colors ${
                currentPage === 'settings'
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings2Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="ml-3 font-medium text-sm">Configuração</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Area Principal */}
      <main className="flex-1 overflow-hidden relative bg-[#050505]">
        {currentPage === 'chat' && <MainChatArea />}
        {currentPage === 'monitor' && (
          <div className="h-full w-full overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <MonitorPage />
            </div>
          </div>
        )}
        {currentPage === 'agents' && (
          <div className="h-full w-full overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto h-full">
              <AgentsPage />
            </div>
          </div>
        )}
        {currentPage === 'settings' && (
          <div className="h-full w-full overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <SettingsPage />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
