import { useState, useEffect, useRef, useCallback } from 'react'
import { api, AGENT_UI_META, BASE_URL } from '../services/api'
import ReactMarkdown from 'react-markdown'

const getAgentSessionId = (agentId) => {
    const today = new Date().toISOString().split('T')[0];
    return `spec-${agentId}-${today}`;
}

/* ─── Code Block with Copy + Collapse ─────────────────────────── */
function CodeBlock({ children, className }) {
    const [copied, setCopied] = useState(false)
    const [collapsed, setCollapsed] = useState(true)
    const code = String(children).replace(/\n$/, '')
    const lines = code.split('\n').length
    const isLong = lines > 12

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="cc-code-block">
            <div className="cc-code-header">
                <span className="cc-code-lang">{(className || '').replace('language-', '') || 'prompt'}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {isLong && (
                        <button className="cc-code-btn" onClick={() => setCollapsed(!collapsed)}>
                            {collapsed ? '▼ Expandir' : '▲ Recolher'}
                        </button>
                    )}
                    <button className="cc-code-btn cc-code-copy" onClick={handleCopy}>
                        {copied ? '✓ Copiado!' : '📋 Copiar'}
                    </button>
                </div>
            </div>
            <pre className={`cc-code-pre ${isLong && collapsed ? 'cc-code-collapsed' : ''}`}>
                <code>{code}</code>
            </pre>
        </div>
    )
}

/* ─── File Download Inline ─────────────────────────────────── */
function FileAttachment({ path }) {
    const filename = path.split('/').pop()
    const ext = filename.split('.').pop().toLowerCase()
    const icons = { html: '🌐', pdf: '📕', docx: '📘', xlsx: '📗', py: '🐍', js: '📜', css: '🎨' }

    return (
        <div className="cc-file-attachment">
            <span className="cc-file-icon">{icons[ext] || '📄'}</span>
            <div className="cc-file-info">
                <span className="cc-file-name">{filename}</span>
                <span className="cc-file-ext">{ext.toUpperCase()}</span>
            </div>
            <a
                href={`${BASE_URL}/api/documents/${encodeURIComponent(filename)}/download`}
                target="_blank"
                rel="noreferrer"
                className="cc-file-download-btn"
            >
                ⬇ Baixar
            </a>
        </div>
    )
}

/* ─── Enhanced Markdown Renderer ─────────────────────────── */
function ChatMarkdown({ content }) {
    // Detect file paths in content and render inline download buttons
    const fileRegex = /(?:Arquivo\s+(?:salvo|gerado)|Baixe\s+aqui|Baixe\s+agora)[:\s]+`?([^\s`]+\.\w{2,5})`?/gi
    const files = []
    let match
    while ((match = fileRegex.exec(content)) !== null) {
        const fullPath = match[1]
        const filename = fullPath.split('/').pop()
        if (!files.find(f => f.filename === filename)) {
            files.push({ fullPath, filename })
        }
    }

    return (
        <div className="markdown-content">
            <ReactMarkdown
                components={{
                    code({ className, children, ...props }) {
                        const isInline = !className && String(children).indexOf('\n') === -1
                        if (isInline) {
                            return <code className="cc-inline-code" {...props}>{children}</code>
                        }
                        return <CodeBlock className={className}>{children}</CodeBlock>
                    }
                }}
            >
                {content}
            </ReactMarkdown>
            {files.length > 0 && (
                <div className="cc-files-section">
                    {files.map((f, i) => (
                        <FileAttachment key={i} path={f.fullPath} />
                    ))}
                </div>
            )}
        </div>
    )
}

/* ─── Main Component ─────────────────────────────────────── */
export default function SpecialistChatPage({ agentId }) {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [sessionId] = useState(getAgentSessionId(agentId))
    const [agentMeta, setAgentMeta] = useState(AGENT_UI_META[agentId] || null)
    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

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
                        : `Conexão estabelecida com o terminal especialista.`;

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
    }, [messages, isTyping, scrollToBottom])

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
        <div className="cc-specialist-page">
            {/* Clean compact header — no animation */}
            <div className="cc-specialist-header">
                <button className="cc-back-btn" onClick={() => { window.location.href = '#/agents'; }}>
                    ← Voltar
                </button>
                <div className="cc-specialist-identity">
                    <span className="cc-specialist-icon">{agentMeta?.iconEmoji || '🤖'}</span>
                    <div className="cc-specialist-info">
                        <span className="cc-specialist-name">{agentMeta?.name || 'Especialista'}</span>
                        <span className="cc-specialist-role">{agentMeta?.role || 'Agent'}</span>
                    </div>
                    <div className="cc-specialist-status">
                        <div className="cc-status-dot online" style={{ width: '6px', height: '6px' }}></div>
                        <span>Online</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="cc-specialist-messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`cc-msg-row ${msg.role}`}>
                        <div className={`cc-msg-bubble ${msg.role}`}>
                            {msg.role === 'assistant' ? (
                                <ChatMarkdown content={msg.content} />
                            ) : msg.content}
                        </div>
                        <div className="cc-msg-meta">
                            {msg.role === 'user' ? 'COMANDO ENVIADO' : (agentMeta ? agentMeta.name.toUpperCase() : 'ESPECIALISTA')} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="cc-msg-row assistant">
                        <div className="cc-msg-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

            {/* Input */}
            <div className="cc-specialist-input-area">
                <div className="cc-specialist-input-wrap">
                    <textarea
                        ref={textareaRef}
                        className="cc-specialist-textarea"
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
                        className="cc-specialist-send-btn"
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
