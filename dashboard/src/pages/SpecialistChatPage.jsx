import { useState, useEffect, useRef } from 'react'
import { api, AGENT_UI_META } from '../services/api'
import ReactMarkdown from 'react-markdown'
import NeuralSphere from '../components/NeuralSphere'

const getAgentSessionId = (agentId) => {
    const today = new Date().toISOString().split('T')[0];
    return `spec-${agentId}-${today}`;
}

export default function SpecialistChatPage({ agentId }) {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [sessionId] = useState(getAgentSessionId(agentId))
    const [agentMeta, setAgentMeta] = useState(AGENT_UI_META[agentId] || null)
    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        setAgentMeta(AGENT_UI_META[agentId] || null);
    }, [agentId])

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await api.getChatHistory(sessionId)
                if (history && history.length > 0) {
                    setMessages(history)
                } else {
                    const welcomeMsg = agentMeta 
                        ? `Olá! Sou o **${agentMeta.name}**, especialista em **${agentMeta.role}**. Como posso aplicar minha expertise ao seu projeto agora? 🧠💡`
                        : `Olá! Conexão estabelecida com o terminal especialista. Como posso ajudar?`;
                    
                    setMessages([{ role: 'assistant', content: welcomeMsg }])
                }
            } catch (e) {
                console.error("Erro ao carregar histórico", e)
            }
        }
        loadHistory()
    }, [sessionId, agentMeta])

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return

        const userMsg = inputValue.trim()
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setInputValue('')

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }

        setIsTyping(true)

        try {
            const response = await api.sendChatMessage(userMsg, sessionId, agentId)
            if (response && response.content) {
                setMessages(prev => [...prev, { role: 'assistant', content: response.content }])
            } else if (response && response.status === 'error') {
                setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Erro: ${response.message || 'Falha na rede neural.'}` }])
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Erro de processamento neural.' }])
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: '🔴 Erro de conexão com o núcleo.' }])
        } finally {
            setIsTyping(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="cc-chat-page-root-futuristic">
            <NeuralSphere />

            {agentMeta && (
                <div className="cc-agent-chat-header fade-in" style={{
                    position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'rgba(15, 23, 42, 0.8)', padding: '8px 24px',
                    borderRadius: '50px', border: '1px solid var(--accent)',
                    backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                }}>
                    <span style={{ fontSize: '24px' }}>{agentMeta.iconEmoji}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>{agentMeta.name}</span>
                            <div className="cc-status-dot online" style={{ width: '6px', height: '6px' }}></div>
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{agentMeta.role}</span>
                    </div>
                </div>
            )}

            <div className="cc-chat-scroll-futuristic">
                {messages.map((msg, i) => (
                    <div key={i} className={`cc-msg-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                        <div className={`cc-chat-bubble-futuristic ${msg.role}`}>
                            <div className="markdown-content">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                        <div className="cc-chat-time-futuristic">
                            {msg.role === 'user' ? 'COMANDO ENVIADO' : (agentMeta ? agentMeta.name.toUpperCase() : 'ESPECIALISTA')} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="cc-msg-wrapper assistant">
                        <div className="cc-chat-bubble-futuristic assistant" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="cc-typing-futuristic">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                                Processando com Expertise IA...
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="cc-input-outer-futuristic">
                <div className="cc-input-inner-futuristic">
                    <textarea
                        ref={textareaRef}
                        className="cc-chat-input-futuristic"
                        placeholder={`Instruir ${agentMeta?.name || 'especialista'}...`}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = (Math.min(e.target.scrollHeight, 120)) + 'px';
                        }}
                    />
                    <button
                        className="cc-send-btn-futuristic"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                        style={{ color: (inputValue.trim() && !isTyping) ? 'var(--accent)' : 'var(--text-tertiary)' }}
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
