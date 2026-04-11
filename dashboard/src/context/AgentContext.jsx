import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const AgentContext = createContext()

export function AgentProvider({ children }) {
    const [agents, setAgents] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeChats, setActiveChats] = useState([]) // Array of agent IDs

    const fetchAgents = useCallback(async () => {
        try {
            const data = await api.getAgents()
            setAgents(data)
        } catch { /* silent */ }
        setLoading(false)
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAgents()
        const interval = setInterval(fetchAgents, 5000)
        return () => clearInterval(interval)
    }, [fetchAgents])

    const openChat = (agentId) => {
        if (!activeChats.includes(agentId)) {
            setActiveChats(prev => [...prev, agentId])
        }
    }

    const closeChat = (agentId) => {
        setActiveChats(prev => prev.filter(id => id !== agentId))
    }

    const onlineCount = agents.filter(a => a.status === 'online' || a.status === 'executando').length
    const ceo = agents.find(a => a.tier === 0)
    const tier1 = agents.filter(a => a.tier === 1)
    const tier2 = agents.filter(a => a.tier === 2)

    return (
        <AgentContext.Provider value={{ 
            agents, loading, onlineCount, ceo, tier1, tier2, 
            activeChats, openChat, closeChat,
            refresh: fetchAgents 
        }}>
            {children}
        </AgentContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAgents() {
    return useContext(AgentContext)
}
