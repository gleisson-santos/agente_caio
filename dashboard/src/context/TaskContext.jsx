import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { api } from '../services/api'

const TaskContext = createContext()

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState([])
    const [events, setEvents] = useState([])
    const [workflows, setWorkflows] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchAll = useCallback(async () => {
        try {
            const [t, e, w] = await Promise.all([api.getTasks(), api.getEvents(), api.getWorkflows()])
            // Only update task list if we got a valid response (getTasks throws on error)
            if (Array.isArray(t)) setTasks(t)
            if (Array.isArray(e)) setEvents(e)
            if (Array.isArray(w)) setWorkflows(w)
        } catch { /* silent — keeps existing state if API fails */ }
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchAll()
        const interval = setInterval(fetchAll, 30000)
        return () => clearInterval(interval)
    }, [fetchAll])

    const tasksByStatus = useMemo(() => ({
        running: tasks.filter(t => t.status === 'running'),
        pending: tasks.filter(t => t.status === 'pending'),
        completed: tasks.filter(t => t.status === 'completed'),
        failed: tasks.filter(t => t.status === 'failed'),
    }), [tasks])

    const createTask = async (data) => {
        const newTask = await api.createTask(data)
        setTasks(prev => [newTask, ...prev])
    }

    const deleteTask = async (id) => {
        await api.deleteTask(id)
        setTasks(prev => prev.filter(t => t.id !== id))
    }

    const executeTask = async (id) => {
        await api.executeTask(id)
        // Optimistically update to 'running' — backend poll every 30s will sync the final status
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'running', progress: 10 } : t))
        // Refresh after 5s to get the real status from backend (process_direct may finish quickly)
        setTimeout(fetchAll, 5000)
        // And again at 15s and 60s to catch longer-running tasks
        setTimeout(fetchAll, 15000)
        setTimeout(fetchAll, 60000)
    }

    return (
        <TaskContext.Provider value={{ tasks, events, workflows, loading, tasksByStatus, createTask, deleteTask, executeTask, refresh: fetchAll }}>
            {children}
        </TaskContext.Provider>
    )
}

export function useTasks() {
    return useContext(TaskContext)
}
