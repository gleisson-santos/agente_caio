import { useState } from 'react'
import './index.css'
import { AgentProvider } from './context/AgentContext'
import { TaskProvider } from './context/TaskContext'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import AgentsPage from './pages/AgentsPage'
import TasksPage from './pages/TasksPage'
import MonitorPage from './pages/MonitorPage'
import SettingsPage from './pages/SettingsPage'
import DocumentsPage from './pages/DocumentsPage'
import CaioPage from './pages/CaioPage'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [focusAgent, setFocusAgent] = useState(null)

  const navigate = (p, agentId = null) => {
    setPage(p)
    setFocusAgent(agentId)
  }

  return (
    <AgentProvider>
      <TaskProvider>
        <div className="app-layout">
          <Sidebar activePage={page} onNavigate={navigate} />
          <main className="main-content">
            {page === 'caio' && <CaioPage />}
            {page === 'dashboard' && <DashboardPage onNavigate={navigate} />}
            {page === 'agents' && <AgentsPage focusAgent={focusAgent} />}
            {page === 'tasks' && <TasksPage />}
            {page === 'documents' && <DocumentsPage />}
            {page === 'monitor' && <MonitorPage />}
            {page === 'settings' && <SettingsPage />}
          </main>
        </div>
      </TaskProvider>
    </AgentProvider>
  )
}
