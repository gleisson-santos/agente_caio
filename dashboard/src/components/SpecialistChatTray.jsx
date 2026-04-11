import { useState } from 'react'
import { useAgents } from '../context/AgentContext'
import SpecialistChat from './SpecialistChat'

export default function SpecialistChatTray() {
    const { activeChats, agents, closeChat } = useAgents()
    const [minimized, setMinimized] = useState([]) // Array of minimized agent IDs

    const toggleMinimize = (id) => {
        setMinimized(prev => prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id])
    }

    if (activeChats.length === 0) return null

    return (
        <div className="specialist-tray" style={{
            position: 'fixed',
            bottom: 0,
            right: '25px',
            display: 'flex',
            flexDirection: 'row-reverse',
            alignItems: 'flex-end',
            gap: '20px',
            zIndex: 9999,
            pointerEvents: 'none',
            maxWidth: 'calc(100vw - 260px)',
            overflowX: 'auto',
            padding: '0 10px 0 10px',
            height: '600px', // Allow enough height for chats but container is at bottom
        }}>
            {activeChats.map(agentId => {
                const agent = agents.find(a => a.id === agentId)
                if (!agent) return null
                const isMini = minimized.includes(agentId)

                return (
                    <div key={agentId} style={{ 
                        width: '420px', 
                        height: isMini ? '48px' : '580px',
                        pointerEvents: 'auto',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                        position: 'relative',
                        borderRadius: '12px 12px 0 0',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        border: isMini ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        flexShrink: 0
                    }}>
                        {/* Control Buttons (Floating) */}
                        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 11, display: 'flex', gap: '6px' }}>
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleMinimize(agentId); }}
                                title={isMini ? "Expandir" : "Minimizar"}
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: 'none',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    borderRadius: '5px',
                                    width: '26px',
                                    height: '26px',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
                            >
                                {isMini ? '▲' : '▼'}
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); closeChat(agentId); }}
                                title="Fechar Estação"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    borderRadius: '5px',
                                    width: '26px',
                                    height: '26px',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => { e.target.style.background = '#ef4444'; e.target.style.color = '#fff'; }}
                                onMouseOut={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.2)'; e.target.style.color = '#ef4444'; }}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div style={{ 
                            height: '100%', 
                            display: isMini ? 'none' : 'block',
                            opacity: isMini ? 0 : 1, 
                            transition: 'opacity 0.3s' 
                        }}>
                             <SpecialistChat 
                                agentId={agent.id}
                                agentName={agent.name}
                                agentIcon={agent.iconEmoji}
                                sessionId={`specialist-${agent.id}-${new Date().toISOString().split('T')[0]}`}
                            />
                        </div>
                        
                        {isMini && (
                            <div onClick={() => toggleMinimize(agentId)} style={{ 
                                height: '48px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '0 16px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '13px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: 'var(--text-primary)',
                                letterSpacing: '0.3px'
                            }}>
                                <span style={{ marginRight: '10px', fontSize: '18px' }}>{agent.iconEmoji}</span>
                                <span style={{ flex: 1 }}>{agent.name}</span>
                                <span style={{ fontSize: '9px', color: 'var(--accent)', marginRight: '34px' }}>DORMÊNCIA ATIVA</span>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
