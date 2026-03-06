import { useState, useEffect, useCallback } from 'react'
import { api, STATUS_CONFIG, EVENT_TYPES } from '../services/api'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const MOCK_LOGS = [
  { time: '13:47:42', level: 'info', msg: 'API: Telegram notification sent: Extracao Pendencias' },
  { time: '13:47:40', level: 'info', msg: 'Supabase upload complete: 3 CSVs (121 registros)' },
  { time: '13:47:38', level: 'info', msg: 'Upload Supabase: Falta_dagua.csv — 9 registros' },
  { time: '13:47:35', level: 'info', msg: 'Upload Supabase: Pavimento.csv — 67 registros' },
  { time: '13:47:32', level: 'info', msg: 'Upload Supabase: Vazamento.csv — 45 registros' },
  { time: '13:46:30', level: 'info', msg: '[EXPORT] Download concluído: 3 CSVs' },
  { time: '13:45:20', level: 'info', msg: 'Telegram bot @CaioAgentbot connected' },
  { time: '13:45:19', level: 'info', msg: 'Uvicorn running on http://0.0.0.0:18795' },
  { time: '13:45:18', level: 'info', msg: 'Starting Telegram bot (polling mode)...' },
  { time: '13:45:17', level: 'info', msg: 'Starting email channel...' },
  { time: '13:45:16', level: 'debug', msg: 'Agent Caio initialized — model: gemini/gemini-2.0-flash' },
  { time: '13:45:15', level: 'info', msg: 'Gateway starting — nanobot v3.0' },
]

export default function MonitorPage() {
  const [agents, setAgents] = useState([])
  const [services, setServices] = useState([])
  const [events, setEvents] = useState([])

  const fetchData = useCallback(async () => {
    const [a, s, e] = await Promise.all([api.getAgents(), api.getServices(), api.getEvents()])
    setAgents(a)
    setServices(s)
    setEvents(e)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
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
  )
}
