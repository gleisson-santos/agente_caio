import { useState, useEffect, useCallback, useRef } from 'react'
import { api, STATUS_CONFIG, EVENT_TYPES, BASE_URL } from '../services/api'

function LiveTraceConsole() {
  const [messages, setMessages] = useState([])
  const scrollRef = useRef(null)

  useEffect(() => {
    // Subscribe to SSE real-time stream
    const cleanup = api.subscribeToTracingStream((data) => {
      setMessages(prev => [...prev.slice(-49), data]) // Keep last 50
    })

    return () => cleanup()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="tracing-live-console">
      <div className="console-header">
        <div className="console-title">
          <span>🧠</span>
          <span>Thought Stream</span>
        </div>
        <div className="live-indicator">
          <span className="live-dot" />
          <span>Live Broadcast</span>
        </div>
      </div>
      <div className="console-body" ref={scrollRef}>
        {messages.length === 0 && (
          <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', opacity: 0.5 }}>
            Aguardando sinal dos agentes...
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className="thought-entry">
            <div className="thought-time">{new Date(m.timestamp).toLocaleTimeString()}</div>
            <div className={`thought-bubble ${m.step || m.type}`}>
               <div className="thought-agent">
                 <span>@{m.agent_id}</span>
                 <span className="thought-step">{m.step || m.type}</span>
               </div>
               <div className="thought-content">{m.content || (m.type === 'run_complete' ? 'Interação finalizada' : '')}</div>
               {m.metadata && Object.keys(m.metadata).length > 0 && (
                 <div className="thought-meta">
                   {JSON.stringify(m.metadata, null, 2)}
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const MOCK_LOGS = [
  {time: '13:47:42', level: 'info', msg: 'API: Telegram notification sent: Evento Agendado' },
  {time: '13:47:40', level: 'info', msg: 'E-mail check complete: 0 novas mensagens' },
  { time: '13:46:30', level: 'info', msg: '[EXPORT] Download concluído: 3 CSVs' },
  { time: '13:45:20', level: 'info', msg: 'Telegram bot @CaioAgentbot connected' },
  { time: '13:45:19', level: 'info', msg: 'Uvicorn running on http://0.0.0.0:18790' },
  { time: '13:45:18', level: 'info', msg: 'Starting Telegram bot (polling mode)...' },
  { time: '13:45:17', level: 'info', msg: 'Starting email channel...' },
  { time: '13:45:16', level: 'debug', msg: 'Agent Caio initialized — model: gemini/gemini-2.0-flash' },
  { time: '13:45:15', level: 'info', msg: 'Gateway starting — nanobot v3.0' },
]

export default function MonitorPage() {
  const [agents, setAgents] = useState([])
  const [services, setServices] = useState([])
  const [traces, setTraces] = useState([])
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'tracing'

  const fetchData = useCallback(async () => {
    const [a, s, t] = await Promise.all([api.getAgents(), api.getServices(), api.getTracingLogs()])
    setAgents(a)
    setServices(s)
    setTraces(t || [])
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const ssoAgent = agents.find(a => a.id === 'agent-sso')
  const tokenAgent = agents.find(a => a.id === 'agent-token')
  const lifeAgent = agents.find(a => a.id === 'agent-life')
  const tokenHistory = tokenAgent?.monitorData?.history || []
  const maxToken = Math.max(...(tokenHistory.length ? tokenHistory : [1]))
  const totalTokens = tokenHistory.reduce((a, b) => a + b, 0)

  return (
    <>
      <div className="page-header fade-in-up">
        <h2>Monitor do Sistema</h2>
        <p>Saúde, consumo de tokens, alertas e logs em tempo real.</p>
      </div>

      <div className="monitor-tabs fade-in-up" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} 
          onClick={() => setActiveTab('overview')}
          style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'overview' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'overview' ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
        >
          Overview (Infra)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tracing' ? 'active' : ''}`} 
          onClick={() => setActiveTab('tracing')}
          style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'tracing' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'tracing' ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
        >
          Agent Tracing (Logs IA)
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Services */}
          <div className="section-title fade-in-up">Serviços</div>
          <div className="services-grid fade-in-up">
            {services.map(svc => (
              <div key={svc.id} className="service-card">
                <span className={`service-dot ${svc.status}`} />
                <div>
                  <div className="service-name">{svc.name}</div>
                  <div className="service-meta">{svc.response} {svc.port ? `· :${svc.port}` : ''} {svc.uptime ? `· ${svc.uptime}` : ''}</div>
                </div>
              </div>
            ))}
          </div>

      {/* Top Row: VPS + Tokens */}
      <div className="monitor-top-row fade-in-up fade-in-up-delay-2">
        {/* VPS Health */}
        <div className="vps-health-card">
          <div className="card-header-premium">
            <span className="header-icon">🖥️</span>
            <div>
              <h3>Saúde do Servidor (Agente SSO)</h3>
              <p>{ssoAgent?.monitorData?.server || 'VPS'} — {ssoAgent?.monitorData?.os || 'Ubuntu'}</p>
            </div>
          </div>
          {ssoAgent && (
            <div className="cc-vps-metrics" style={{ marginTop: '12px' }}>
              {[
                { label: 'CPU', value: ssoAgent.metrics.cpu },
                { label: 'Memória', value: ssoAgent.metrics.memory },
                { label: 'Disco', value: ssoAgent.metrics.disk },
              ].map(m => (
                <div key={m.label} className="cc-vps-metric">
                  <div className="vm-top"><span className="vm-label">{m.label}</span><span className="vm-value">{m.value}%</span></div>
                  <div className="cc-vps-track">
                    <div className="cc-vps-fill" style={{ width: `${m.value}%`, background: m.value > 80 ? 'var(--red)' : m.value > 60 ? 'var(--amber)' : 'var(--accent)' }} />
                  </div>
                </div>
              ))}
              <div className="cc-vps-metric">
                <div className="vm-top"><span className="vm-label">Uptime</span><span className="vm-value">{ssoAgent.metrics.uptime}</span></div>
                <div className="vm-top"><span className="vm-label">Ping</span><span className="vm-value">{ssoAgent.metrics.ping}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Token Usage */}
        <div className="token-usage-card">
          <div className="card-header-premium">
            <span className="header-icon">💎</span>
            <div>
              <h3>Consumo de Tokens (Agente Token)</h3>
              <p>Últimos 12 meses — uso mensal</p>
            </div>
          </div>
          <div className="token-chart-premium">
            <div className="token-sparkline">
              {tokenHistory.map((val, i) => (
                <div key={i} className="token-bar" style={{ height: `${(val / maxToken) * 100}%` }}>
                  <span className="token-tooltip">{MONTHS[i]}: {val}K</span>
                </div>
              ))}
            </div>
            <div className="token-labels"><span>{MONTHS[0]}</span><span>{MONTHS[11]}</span></div>
          </div>
          <div className="token-summary">
            <div className="token-sum-item"><span className="sum-val">{(totalTokens * 1000).toLocaleString()}</span><span className="sum-lab">Total Ano</span></div>
            <div className="token-sum-item"><span className="sum-val">{tokenHistory.length ? `${tokenHistory[tokenHistory.length - 1]}K` : '—'}</span><span className="sum-lab">Este Mês</span></div>
            {tokenAgent?.metrics && (
              <div className="token-sum-item"><span className="sum-val">{tokenAgent.metrics.tokensTrend}</span><span className="sum-lab">Tendência</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts from Life Agent */}
      {lifeAgent?.monitorData?.recentAlerts?.length > 0 && (
        <div className="alerts-section fade-in-up fade-in-up-delay-3">
          <div className="section-title">Alertas (Agente Life)</div>
          <div className="alerts-bar-premium">
            {lifeAgent.monitorData.recentAlerts.map((alert, i) => (
              <div key={i} className="alert-card-premium alert-warning">
                <div className="alert-accent" />
                <span className="alert-icon-premium">⚠️</span>
                <div className="alert-content-premium">
                  <div className="alert-title-row"><strong>{alert.level.toUpperCase()}</strong></div>
                  <span>{alert.msg} — {alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="monitor-bottom-premium fade-in-up fade-in-up-delay-4">
        <div className="section-title">Logs do Sistema</div>
        <div className="logs-container-premium">
          <div className="terminal-log-viewer">
            {MOCK_LOGS.map((log, i) => (
              <div key={i} className="terminal-line">
                <span className="t-time">{log.time}</span>
                <span className={`t-level ${log.level}`}>[{log.level.toUpperCase()}]</span>
                <span className="t-msg">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>
      ) : (
        <div className="tracing-container fade-in-up">
          <div className="section-title">Live Agent Tracing & Thoughts</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Acompanhe o raciocínio da IA e a execução ferramentas em tempo real.</p>
          
          <LiveTraceConsole />

          <div className="section-title" style={{ marginTop: '3rem' }}>Trace History</div>
          <div className="traces-feed" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {traces.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '12px' }}>
                <span style={{ fontSize: '2rem' }}>🕵️</span>
                <p>Nenhum trace histórico registrado ainda.</p>
              </div>
            ) : traces.map((trace, idx) => (
              <div key={idx} className="trace-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div className="trace-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <span style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                       {trace.agent_id?.toUpperCase() || 'AGENT'}
                     </span>
                     <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> via {trace.channel}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⏱ {trace.duration_ms}ms</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(trace.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
                
                <div className="trace-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="trace-prompt" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Prompt</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'pre-wrap', margin: 0 }}>{trace.prompt_preview}</p>
                  </div>
                  <div className="trace-response" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', borderLeft: '2px solid var(--accent)' }}>
                    <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Response</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'pre-wrap', margin: 0 }}>{trace.response_preview}</p>
                  </div>
                </div>
                
                <div className="trace-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', fontSize: '0.8rem' }}>
                  <div className="trace-tools" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                     {trace.tools_used && trace.tools_used.length > 0 ? (
                       trace.tools_used.map((tool, i) => (
                         <span key={i} style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>🔧 {tool}</span>
                       ))
                     ) : (
                       <span style={{ color: 'var(--text-muted)' }}>Nenhuma ferramenta usada</span>
                     )}
                  </div>
                  <div className="trace-model" style={{ color: 'var(--text-muted)' }}>{trace.model}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
