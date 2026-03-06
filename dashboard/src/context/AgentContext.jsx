import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const AgentContext = createContext()

export function AgentProvider({ children }) {
    const [agents, setAgents] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchAgents = useCallback(async () => {
        try {
            const data = await api.getAgents()
            setAgents(data)
        } catch { /* silent */ }
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchAgents()
        const interval = setInterval(fetchAgents, 30000)
        return () => clearInterval(interval)
    }, [fetchAgents])

    const onlineCount = agents.filter(a => a.status === 'online' || a.status === 'executando').length
    const ceo = agents.find(a => a.tier === 0)
    const tier1 = agents.filter(a => a.tier === 1)
    const tier2 = agents.filter(a => a.tier === 2)

    return (
        <AgentContext.Provider value={{ agents, loading, onlineCount, ceo, tier1, tier2, refresh: fetchAgents }}>
            {children}
        </AgentContext.Provider>
    )
}

export function useAgents() {
    return useContext(AgentContext)
}
