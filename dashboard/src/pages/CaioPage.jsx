import { useState, useEffect, useRef } from 'react'
import { api, AGENT_UI_META } from '../services/api'

const getDailySessionId = () => {
    const today = new Date().toISOString().split('T')[0];
    return `dashboard-daily-${today}`;
}

export default function CaioPage() {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [sessionId] = useState(getDailySessionId())
    const [activeAgentId, setActiveAgentId] = useState(null)
    const [agentMeta, setAgentMeta] = useState(null)
    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        // Detect specialist from URL hash: #/chat?agent=lovable
        const hash = window.location.hash;
        if (hash.includes('agent=')) {
            const id = hash.split('agent=')[1].split('&')[0]; // Safe split
            
            // Try matching directly, then with spec- prefix
            let foundId = id;
            if (!AGENT_UI_META[foundId]) {
                const specId = `spec-${id}`;
                if (AGENT_UI_META[specId]) {
                    foundId = specId;
                }
            }

            setActiveAgentId(foundId);
            setAgentMeta(AGENT_UI_META[foundId] || null);
        }
    }, [])

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await api.getChatHistory(sessionId)
                if (history && history.length > 0) {
                    setMessages(history)
                } else {
                    const welcomeMsg = agentMeta 
                        ? `Olá! Sou o ${agentMeta.name}, especialista em ${agentMeta.role}. Como posso ajudar você com sua expertise hoje? 🧠✨`
                        : 'Olá! Sou o Caio, seu assistente inteligente. Como posso ajudar você hoje? 🧠✨\n\nMinha interface neural está ativa e pronta para extrações, análises e comandos.';
                    
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
            const response = await api.sendChatMessage(userMsg, sessionId, activeAgentId)
            if (response && response.content) {
                setMessages(prev => [...prev, { role: 'assistant', content: response.content }])
            } else if (response && response.status === 'error') {
                const isTimeout = response.message?.toLowerCase().includes('timeout') || response.message?.toLowerCase().includes('abort')
                const errMsg = isTimeout
                    ? '⏳ A tarefa está demorando mais que o esperado (modelo processando tool calls). Verifique o Dashboard — a extração pode ter iniciado em segundo plano!'
                    : `⚠️ Erro: ${response.message || 'Resposta inesperada do servidor.'}`
                setMessages(prev => [...prev, { role: 'assistant', content: errMsg }])
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Erro de processamento neural. Tente novamente.' }])
            }
        } catch (err) {
            const isTimeout = err.name === 'AbortError' || err.message?.includes('timeout')
            const errMsg = isTimeout
                ? '⏳ A tarefa está demorando mais que o esperado. Verifique o Dashboard para acompanhar o progresso!'
                : '🔴 Núcleo offline. Verifique a conexão com o servidor gateway.'
            setMessages(prev => [...prev, { role: 'assistant', content: errMsg }])
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

    // Função para renderizar conteúdo estruturado em cards
    const renderMessageContent = (content) => {
        // Se o conteúdo tiver múltiplas seções separadas por "###" ou similar
        const sections = content.split('\n\n');

        return (
            <div className="cc-structured-content">
                {sections.map((section, idx) => {
                    const lines = section.split('\n');
                    const firstLine = lines[0].trim();

                    // Detecta se é um título ou lista para criar card
                    if (firstLine.startsWith('###') || firstLine.startsWith('**') || firstLine.includes(':')) {
                        return (
                            <div key={idx} className="cc-res-card">
                                <div className="cc-res-title">
                                    <span style={{ width: '4px', height: '12px', background: 'var(--blue)', borderRadius: '2px' }}></span>
                                    {firstLine.replace(/[#*]/g, '')}
                                </div>
                                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                                    {lines.slice(1).join('\n')}
                                </div>
                            </div>
                        );
                    }

                    return <div key={idx} style={{ whiteSpace: 'pre-wrap' }}>{section}</div>;
                })}
            </div>
        );
    }

    return (
        <div className="cc-chat-page-root-futuristic">
            {/* Clean header area - no neural animation */}
            <div style={{
                padding: '14px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(15,15,20,0.95)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexShrink: 0
            }}>
                <div style={{ fontSize: '28px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99,102,241,0.1)', borderRadius: '10px' }}>🐈</div>
                <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>Caio</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Neural Core • Online</div>
                </div>
            </div>

            {agentMeta && (
                <div className="cc-agent-chat-header fade-in" style={{
                    position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'rgba(15, 23, 42, 0.8)', padding: '8px 20px',
                    borderRadius: '50px', border: '1px solid rgba(59, 130, 246, 0.3)',
                    backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }}>
                    <span style={{ fontSize: '20px' }}>{agentMeta.iconEmoji}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{agentMeta.name}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{agentMeta.role}</span>
                    </div>
                    <button 
                        onClick={() => { window.location.href = '#/agents'; }}
                        style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}
                    >✕</button>
                </div>
            )}

            <div className="cc-chat-scroll-futuristic">
                {messages.map((msg, i) => (
                    <div key={i} className={`cc-msg-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                        <div className="cc-chat-bubble-futuristic">
                            {msg.role === 'user' ? msg.content : renderMessageContent(msg.content)}
                        </div>
                        <div className="cc-chat-time-futuristic">
                            {msg.role === 'user' ? 'VOCÊ' : (agentMeta ? agentMeta.name.toUpperCase() : 'CAIO • NEURAL CORE')} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="cc-msg-wrapper assistant">
                        <div className="cc-chat-bubble-futuristic" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="cc-typing-futuristic">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                                Processando com IA + Tools...
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
                        placeholder="Inicie um processo ou faça uma pergunta..."
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
