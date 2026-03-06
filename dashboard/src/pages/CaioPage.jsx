import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import NeuralSphere from '../components/NeuralSphere'

const getDailySessionId = () => {
    const today = new Date().toISOString().split('T')[0];
    return `dashboard-daily-${today}`;
}

export default function CaioPage() {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [sessionId] = useState(getDailySessionId())
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
                    setMessages([
                        {
                            role: 'assistant',
                            content: 'Olá! Sou o Caio, seu assistente inteligente. Como posso ajudar você hoje? 🧠✨\n\nMinha interface neural está ativa e pronta para extrações, análises e comandos.'
                        }
                    ])
                }
            } catch (e) {
                console.error("Erro ao carregar histórico", e)
            }
        }
        loadHistory()
    }, [sessionId])

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
            const response = await api.sendChatMessage(userMsg, sessionId)
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
            <NeuralSphere />

            <div className="cc-chat-scroll-futuristic">
                {messages.map((msg, i) => (
                    <div key={i} className={`cc-msg-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                        <div className="cc-chat-bubble-futuristic">
                            {msg.role === 'user' ? msg.content : renderMessageContent(msg.content)}
                        </div>
                        <div className="cc-chat-time-futuristic">
                            {msg.role === 'user' ? 'YOU' : 'CAIO • NEURAL CORE'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
