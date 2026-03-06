import { useState, useEffect, useCallback, useRef } from 'react'
import { FileText, Presentation, FileSpreadsheet, FileEdit, Sparkles, Trash2, Loader2, Download, Eye, FileArchive, CheckCircle2, Folder, Calendar, Package } from 'lucide-react'
import { api } from '../services/api'
import ReactMarkdown from 'react-markdown'

const aiExamples = [
  'Crie um contrato de prestação de serviços para consultoria de TI',
  'Gere um relatório gerencial mensal com indicadores de desempenho',
  'Faça uma apresentação executiva de 5 slides sobre resultados Q1',
  'Monte uma ata de reunião do comitê de segurança',
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(`dashboard-docs-${new Date().toISOString().split('T')[0]}`)
  const [aiFormat, setAiFormat] = useState('docx')
  const [statusMsg, setStatusMsg] = useState(null)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const pollRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadHistory = useCallback(async () => {
    try {
      const history = await api.getChatHistory(sessionId)
      if (history && history.length > 0) {
        setMessages(history)
      } else {
        setMessages([
          {
            role: 'assistant',
            content: 'Olá! Sou o seu Especialista em Documentos. Me diga qual o tipo de documento que você deseja criar (PDF, PPTX, DOCX, XLSX) e sobre qual assunto. Farei perguntas para alinhar os detalhes e gerarei o arquivo com dados profissionais para você!'
          }
        ])
      }
    } catch (e) {
      console.error("Erro ao carregar histórico", e)
    }
  }, [sessionId])

  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await api.listDocuments()
      setDocuments(docs)
    } catch (e) { /* silent */ }
  }, [])

  useEffect(() => {
    fetchDocuments()
    loadHistory()
    const interval = setInterval(fetchDocuments, 10000)
    return () => clearInterval(interval)
  }, [fetchDocuments, loadHistory])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])
  const showStatus = (msg, duration = 5000) => {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(null), duration)
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMsg = inputValue.trim()
    const tempId = 'temp-' + Date.now()

    setMessages(prev => [
      ...prev,
      { role: 'user', content: userMsg },
      { id: tempId, role: 'assistant', content: '⏳ Entendido! Vou analisar e gerar seu documento agora mesmo. Só um momento...', isTemporary: true }
    ])
    setInputValue('')

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    setIsTyping(true)

    try {
      const response = await api.sendChatMessage(userMsg, sessionId)

      setMessages(prev => prev.filter(m => m.id !== tempId)) // Remove temporary message

      if (response && response.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.content }])
        fetchDocuments()
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Erro de processamento neural. Tente novamente.' }])
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setMessages(prev => [...prev, { role: 'assistant', content: '⏳ A tarefa está demorando ou o núcleo está offline. Verifique a listagem abaixo!' }])
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

  // Removed template generate and preview

  const handleDelete = async (filename) => {
    if (!confirm(`Excluir "${filename}"?`)) return
    try {
      await api.deleteDocument(filename)
      showStatus(`🗑️ "${filename}" excluído`)
      fetchDocuments()
    } catch (e) { /* silent */ }
  }

  const formatDate = (iso) => {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const catColors = {
    legal: { bg: 'rgba(255,171,0,0.12)', text: '#FFB300' },
    empresarial: { bg: 'rgba(0,200,150,0.12)', text: '#00C896' },
  }

  const typeIcons = {
    pdf: <FileText size={16} style={{ color: '#ef4444' }} />,
    pptx: <Presentation size={16} style={{ color: '#f97316' }} />,
    xlsx: <FileSpreadsheet size={16} style={{ color: '#22c55e' }} />,
    docx: <FileEdit size={16} style={{ color: '#3b82f6' }} />,
    html: <FileText size={16} style={{ color: '#0ea5e9' }} />,
    bat: <Package size={16} style={{ color: '#eab308' }} />,
    sh: <Package size={16} style={{ color: '#8b5cf6' }} />
  }

  const listIcons = {
    pdf: <FileText size={22} style={{ color: '#ef4444' }} />,
    pptx: <Presentation size={22} style={{ color: '#f97316' }} />,
    xlsx: <FileSpreadsheet size={22} style={{ color: '#22c55e' }} />,
    docx: <FileEdit size={22} style={{ color: '#3b82f6' }} />,
    html: <FileText size={22} style={{ color: '#0ea5e9' }} />,
    bat: <Package size={22} style={{ color: '#eab308' }} />,
    sh: <Package size={22} style={{ color: '#8b5cf6' }} />
  }

  const statsByType = documents.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1
    return acc
  }, {})

  return (
    <>
      <div className="page-header fade-in-up">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileArchive size={26} className="text-blue-500" /> Documentos & Gerador Inteligente</h2>
        <p>Crie documentos profissionais com conteúdo real. Geração rápida ou com IA do Caio.</p>
      </div>

      {/* Status Toast */}
      {statusMsg && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '14px 24px', borderRadius: 12, maxWidth: 440,
          background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(59,130,246,0.3)',
          color: '#fff', fontSize: 14, fontWeight: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
        }}>
          {statusMsg}
        </div>
      )}

      {/* Removed Template Preview Modal */}

      {/* Document Chat Interface */}
      <div className="fade-in-up fade-in-up-delay-1" style={{
        background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', height: '500px', marginBottom: 30, boxShadow: 'var(--glow-subtle)'
      }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Sparkles size={20} className="text-purple-400" />
          <span style={{ fontWeight: 600, fontSize: 16 }}>Especialista em Documentos</span>
        </div>

        <div className="cc-chat-scroll-futuristic" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`cc-msg-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}>
              <div className="cc-chat-bubble-futuristic markdown-body">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              <div className="cc-chat-time-futuristic">
                {msg.role === 'user' ? 'VOCÊ' : 'CAIO • DOC EXPERT'}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="cc-msg-wrapper assistant">
              <div className="cc-chat-bubble-futuristic" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="cc-typing-futuristic"><span></span><span></span><span></span></div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>Processando requisição de documento...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.1)', borderRadius: '0 0 16px 16px' }}>
          <div style={{ position: 'relative', display: 'flex', gap: 12 }}>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={e => {
                setInputValue(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Crie um relatório gerencial PDF sobre os resultados de Q3..."
              className="cc-chat-input-futuristic"
              rows={1}
              style={{
                flex: 1, padding: '14px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', fontSize: 14,
                resize: 'none', minHeight: '50px', maxHeight: '150px', outline: 'none', fontFamily: 'inherit'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#fff', border: 'none',
                borderRadius: 12, padding: '0 24px', fontWeight: 600, fontSize: 14, cursor: inputValue.trim() && !isTyping ? 'pointer' : 'not-allowed',
                opacity: inputValue.trim() && !isTyping ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
              }}
            >
              Projetar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {documents.length > 0 && (
        <div className="fade-in-up" style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{
            padding: '10px 18px', borderRadius: 10, background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.15)', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <Folder size={16} className="text-blue-400" /> <strong>{documents.length}</strong> documentos gerados
          </div>
          {Object.entries(statsByType).map(([type, count]) => (
            <div key={type} style={{
              padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)', fontSize: 13,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{typeIcons[type] || <FileText size={16} />} <span>{type.toUpperCase()}: <strong>{count}</strong></span></div>
            </div>
          ))}
        </div>
      )}

      {/* Documents List */}
      <div className="fade-in-up">
        {documents.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)',
            background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ marginBottom: 16, opacity: 0.4, display: 'flex', justifyContent: 'center' }}><FileArchive size={48} /></span>
            <p style={{ fontSize: 16, marginBottom: 8 }}>Nenhum documento gerado ainda</p>
            <p style={{ fontSize: 13 }}>Use a geração rápida ou peça ao Caio para criar!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {documents.map((doc, i) => (
              <div key={doc.name + i} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px',
                borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
              >
                <div style={{ flexShrink: 0, padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {listIcons[doc.type] || <FileText size={22} style={{ color: '#94a3b8' }} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 500, fontSize: 15, color: 'var(--text-primary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{doc.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap', fontWeight: 500 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} /> {formatDate(doc.createdAt)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Package size={13} /> {doc.sizeFormatted}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Folder size={13} /> out/{doc.name}</span>
                  </div>
                </div>

                <span style={{
                  fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.4)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}><CheckCircle2 size={14} /> Pronto</span>

                <button
                  onClick={() => api.downloadDocument(doc.name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                    background: 'transparent',
                    color: '#fff', fontWeight: 500, fontSize: 13, transition: 'all 0.2s',
                    flexShrink: 0, whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <Download size={14} /> Baixar
                </button>

                <button onClick={() => handleDelete(doc.name)} title="Excluir" style={{
                  padding: '8px', borderRadius: 8, border: 'none',
                  background: 'transparent', color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#F87171'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                ><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

