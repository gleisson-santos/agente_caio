import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { api } from '../services/api'

export default function SpecialistChat({ agentId, agentName, agentIcon, sessionId }) {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await api.getChatHistory(sessionId)
                if (history && history.length > 0) {
                    setMessages(history)
                } else {
                    const welcomeMsg = `Conexão estabelecida com **${agentName}**. Como posso aplicar minha expertise ao seu projeto agora? 🧠💡`;
                    setMessages([{ role: 'assistant', content: welcomeMsg }])
                }
            } catch (e) {
                console.error("Erro ao carregar histórico local", e)
            }
        }
        loadHistory()
    }, [sessionId, agentName])

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
        <div className="specialist-chat-container fade-in" style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
            {/* Header Mini */}
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <span style={{ fontSize: '20px' }}>{agentIcon}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Terminal Especialista</span>
                    <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase' }}>{agentName}</span>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="cc-status-dot online" style={{ width: '8px', height: '8px' }}></div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>LINK SEGURO</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="chat-messages-scroll" style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '20px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: '#0a0a0c'
            }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '90%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                    }}>
                        <div className={`chat-bubble ${msg.role}`} style={{
                            padding: '12px 16px',
                            borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: msg.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.07)',
                            color: msg.role === 'user' ? '#000' : 'var(--text-primary)',
                            fontSize: '13.5px',
                            lineHeight: '1.6',
                            border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                            boxShadow: msg.role === 'user' ? '0 4px 12px rgba(59,130,246,0.3)' : 'none'
                        }}>
                            {msg.role === 'assistant' ? (
                                <div className="markdown-content">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            ) : msg.content}
                        </div>
                        <div style={{ 
                            fontSize: '9px', 
                            color: 'var(--text-tertiary)', 
                            textAlign: msg.role === 'user' ? 'right' : 'left',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            padding: '0 4px'
                        }}>
                            {msg.role === 'user' ? 'COMANDO ENVIADO' : agentName}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.04)', padding: '10px 16px', borderRadius: '18px 18px 18px 4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="typing-indicator" style={{ display: 'flex', gap: '5px' }}>
                            <span className="dot" style={{ width: '5px', height: '5px' }}></span>
                            <span className="dot" style={{ width: '5px', height: '5px' }}></span>
                            <span className="dot" style={{ width: '5px', height: '5px' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ 
                padding: '16px', 
                borderTop: '1px solid var(--border-color)',
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s ease'
                }} className="chat-input-wrapper">
                    <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value)
                            e.target.style.height = 'auto'
                            e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px'
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={`Instruir ${agentName}...`}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '13.5px',
                            outline: 'none',
                            resize: 'none',
                            maxHeight: '150px',
                            padding: '6px 0',
                            fontWeight: '400'
                        }}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: (inputValue.trim() && !isTyping) ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                            color: (inputValue.trim() && !isTyping) ? '#000' : 'rgba(255,255,255,0.3)',
                            border: 'none',
                            cursor: (inputValue.trim() && !isTyping) ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            alignSelf: 'flex-end',
                            marginBottom: '2px'
                        }}
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    )
}
