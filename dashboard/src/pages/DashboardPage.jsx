import { useState, useEffect, useCallback } from 'react'
import { Brain, Coins, Database, HeartPulse, Server, Zap, Mail, CalendarClock, FileText, Package, Activity } from 'lucide-react'
import { api, STATUS_CONFIG, EVENT_TYPES } from '../services/api'

// ─── STATUS BADGE ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.offline
  return (
    <span className={`cc-status ${status}`}>
      <span className="cc-status-dot" />
      {cfg.label}
    </span>
  )
}

// ─── AGENT CARD (Tier 1 & 2) ──────────────────────────────────────
function AgentCard({ agent, selected, onClick }) {
  const m = agent.metrics || {}
  return (
    <div
      className={`cc-agent-card ${selected ? 'selected' : ''} ${agent.comingSoon ? 'coming-soon' : ''}`}
      onClick={() => !agent.comingSoon && onClick(agent.id)}
    >
      {agent.comingSoon && <span className="cc-coming-soon">Em breve</span>}
      <div className="cc-card-top">
        <div className={`cc-card-icon ${agent.iconClass}`}>
          {agent.iconClass === 'ceo' && <Brain size={20} />}
          {agent.iconClass === 'token' && <Coins size={20} />}
          {agent.iconClass === 'bd' && <Database size={20} />}
          {agent.iconClass === 'life' && <HeartPulse size={20} />}
          {agent.iconClass === 'sso' && <Server size={20} />}
          {agent.iconClass === 'pendencias' && <Zap size={20} />}
          {agent.iconClass === 'email' && <Mail size={20} />}
          {agent.iconClass === 'schedule' && <CalendarClock size={20} />}
          {agent.iconClass === 'docs' && <FileText size={20} />}
          {agent.iconClass === 'almox' && <Package size={20} />}
          {!['ceo', 'token', 'bd', 'life', 'sso', 'pendencias', 'email', 'schedule', 'docs', 'almox'].includes(agent.iconClass) && <Activity size={20} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="cc-card-name">{agent.name}</div>
          <div className="cc-card-role">{agent.role}</div>
        </div>
        <StatusBadge status={agent.status} />
      </div>
      {!agent.comingSoon && agent.type === 'agent' && (
        <div className="cc-card-metrics">
          {agent.id === 'agent-token' && (<>
            <div className="cc-mini-metric"><span className="mm-val">{(m.tokensToday || 0).toLocaleString()}</span><span className="mm-lab">Hoje</span></div>
            <div className="cc-mini-metric"><span className="mm-val">{m.tokensTrend || '—'}</span><span className="mm-lab">Tendência</span></div>
          </>)}
          {agent.id === 'agent-bd' && (<>
            <div className="cc-mini-metric"><span className="mm-val">{m.totalTables || 0}</span><span className="mm-lab">Tabelas</span></div>
            <div className="cc-mini-metric"><span className="mm-val">{Math.round(m.avgResponseMs || 0)}ms</span><span className="mm-lab">Resp</span></div>
            <div className="cc-mini-metric"><span className="mm-val" style={{ color: (m.failedQueries || 0) > 0 ? 'var(--red)' : 'var(--green)' }}>{m.failedQueries || 0}</span><span className="mm-lab">Falhas</span></div>
          </>)}
          {agent.id === 'agent-life' && (<>
            <div className="cc-mini-metric"><span className="mm-val">{m.agentsCount || m.agentsMonitored || 0}</span><span className="mm-lab">Agentes</span></div>
            <div className="cc-mini-metric"><span className="mm-val">{m.specialistsCount || 0}</span><span className="mm-lab">Especialistas</span></div>
            <div className="cc-mini-metric"><span className="mm-val" style={{ color: (m.errorsLast24h || 0) > 0 ? 'var(--red)' : 'var(--green)' }}>{m.errorsLast24h || 0}</span><span className="mm-lab">Erros 24h</span></div>
            <div className="cc-mini-metric"><span className="mm-val">{m.uptimePercent || 0}%</span><span className="mm-lab">Uptime</span></div>
          </>)}
          {agent.id === 'agent-sso' && (<>
            <div className="cc-mini-metric"><span className="mm-val">{m.cpu || 0}%</span><span className="mm-lab">CPU</span></div>
            <div className="cc-mini-metric"><span className="mm-val">{m.memory || 0}%</span><span className="mm-lab">MEM</span></div>
            <div className="cc-mini-metric"><span className="mm-val">{m.uptime || '—'}</span><span className="mm-lab">Uptime</span></div>
          </>)}
        </div>
      )}
      {!agent.comingSoon && agent.type === 'specialist' && (
        <div className="cc-card-metrics">
          {agent.id === 'spec-pendencias' && (<>
            <div className="cc-mini-metric">
              <span className="mm-val" style={{ color: 'var(--accent)' }}>
                {agent.monitorData?.today_extractions ?? 0}
              </span>
              <span className="mm-lab">Hoje</span>
            </div>
            <div className="cc-mini-metric">
              <span className="mm-val" style={{
                fontSize: '11px', color: (() => {
                  const ts = agent.monitorData?.thread_status
                  if (!ts) return 'var(--text-muted)'
                  return Object.values(ts).every(s => s.includes('✅')) ? 'var(--green)' : 'var(--amber)'
                })()
              }}>
                {(() => {
                  const ts = agent.monitorData?.thread_status
                  if (!ts) return '—'
                  const all = Object.values(ts)
                  const ok = all.filter(s => s.includes('✅')).length
                  return `Threads ${ok}/${all.length}`
                })()}
              </span>
              <span className="mm-lab">Status</span>
            </div>
          </>)}
          {agent.extractionData && agent.id !== 'spec-pendencias' && (<>
            <div className="cc-mini-metric"><span className="mm-val">{agent.extractionData.records?.total || 0}</span><span className="mm-lab">Registros</span></div>
            <div className="cc-mini-metric"><span className="mm-val">{agent.extractionData.duration || '—'}</span><span className="mm-lab">Duração</span></div>
          </>)}
          {agent.id === 'spec-email' && (<>
            <div className="cc-mini-metric"><span className="mm-val">{m.unread || 0}</span><span className="mm-lab">Não lidos</span></div>
            <div className="cc-mini-metric"><span className="mm-val">{m.urgentAlerts || 0}</span><span className="mm-lab">Urgentes</span></div>
          </>)}
          {agent.id === 'spec-schedule' && (<>
            <div className="cc-mini-metric"><span className="mm-val">{m.activeCrons || 0}</span><span className="mm-lab">CRONs</span></div>
            <div className="cc-mini-metric"><span className="mm-val">{m.eventsToday || 0}</span><span className="mm-lab">Eventos</span></div>
          </>)}
          {agent.id === 'spec-docs' && (
            <div className="cc-mini-metric"><span className="mm-val">{m.docsGenerated || 0}</span><span className="mm-lab">Gerados</span></div>
          )}
          {agent.id === 'spec-ms' && (<>
            <div className="cc-mini-metric"><span className="mm-val">{agent.monitorProject || '—'}</span><span className="mm-lab">Projeto</span></div>
          </>)}
        </div>
      )}
    </div>
  )
}

// ─── BD AGENT DRILLDOWN (connections table + tables) ───────────────
function BDDrilldown({ agent }) {
  const [connections, setConnections] = useState([])
  const [expandedConn, setExpandedConn] = useState(null)
  const m = agent.metrics || {}

  useEffect(() => {
    const fetchConns = async () => {
      const data = await api.getDbConnections()
      if (data && Array.isArray(data)) setConnections(data)
    }
    fetchConns()
    const interval = setInterval(fetchConns, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (s) => s === 'online' ? '#22c55e' : s === 'error' ? '#ef4444' : '#52525b'
  const getStatusLabel = (s) => s === 'online' ? '● Online' : s === 'error' ? '● Erro' : '● Offline'

  const totalTablesAll = connections.reduce((sum, c) => sum + (c.table_count || 0), 0)

  return (
    <>
      {/* Summary metrics */}
      <div className="cc-drill-metrics">
        <div className="cc-drill-metric">
          <div className="dm-val" style={{ color: 'var(--accent)' }}>{m.connectionsTotal || connections.length}</div>
          <div className="dm-lab">Bancos</div>
        </div>
        <div className="cc-drill-metric">
          <div className="dm-val" style={{ color: 'var(--green)' }}>{m.connectionsOnline || 0}</div>
          <div className="dm-lab">Online</div>
        </div>
        <div className="cc-drill-metric">
          <div className="dm-val" style={{ color: 'var(--cyan)' }}>{totalTablesAll || m.totalTables || 0}</div>
          <div className="dm-lab">Tabelas</div>
        </div>
        <div className="cc-drill-metric">
          <div className="dm-val">{Math.round(m.avgResponseMs || 0)}ms</div>
          <div className="dm-lab">Tempo Médio</div>
        </div>
        <div className="cc-drill-metric">
          <div className="dm-val" style={{ color: (m.failedQueries || 0) > 0 ? 'var(--red)' : 'var(--green)' }}>{m.failedQueries || 0}</div>
          <div className="dm-lab">Falhas</div>
        </div>
      </div>

      {/* Connections & Tables */}
      <div className="cc-drill-section">
        <h4>🗄️ Bancos de Dados Monitorados ({connections.length})</h4>
        <div className="cc-db-connections">
          {connections.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Nenhuma conexão configurada. Adicione em <code>config.json → supabase_connections</code>
            </div>
          )}
          {connections.map((conn, i) => (
            <div key={i} className={`cc-db-conn-row ${expandedConn === i ? 'expanded' : ''}`} onClick={() => setExpandedConn(expandedConn === i ? null : i)}>
              <div className="cc-db-conn-main">
                <div className="cc-db-conn-status" style={{ color: getStatusColor(conn.status) }}>
                  {getStatusLabel(conn.status)}
                </div>
                <div className="cc-db-conn-name">{conn.name}</div>
                <div className="cc-db-conn-url">{conn.url}</div>
                <div className="cc-db-conn-stats">
                  <span className="conn-stat"><strong>{conn.table_count || 0}</strong> tabelas</span>
                  <span className="conn-stat"><strong>{Math.round(conn.last_ping_ms || 0)}</strong>ms</span>
                  <span className="conn-stat" style={{ color: (conn.failed_queries || 0) > 0 ? '#ef4444' : '#22c55e' }}><strong>{conn.failed_queries || 0}</strong> falhas</span>
                </div>
              </div>
              {expandedConn === i && (
                <div className="cc-db-conn-detail fade-in-up">
                  {/* Connection summary tags */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span className="skill-tag" style={{ background: 'rgba(59,130,246,.15)', color: '#3b82f6' }}>Ping: {Math.round(conn.last_ping_ms || 0)}ms</span>
                    <span className="skill-tag" style={{ background: 'rgba(34,197,94,.15)', color: '#22c55e' }}>Health checks: {conn.total_queries || 0}</span>
                    <span className="skill-tag" style={{ background: 'rgba(168,85,247,.15)', color: '#a855f7' }}>Média: {Math.round(conn.avg_response_ms || 0)}ms</span>
                    <span className="skill-tag" style={{ background: (conn.failed_queries || 0) > 0 ? 'rgba(239,68,68,.15)' : 'rgba(34,197,94,.15)', color: (conn.failed_queries || 0) > 0 ? '#ef4444' : '#22c55e' }}>Falhas: {conn.failed_queries || 0}</span>
                  </div>

                  {/* Table list */}
                  {conn.tables && conn.tables.length > 0 && (
                    <div>
                      <h5 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>📋 Tabelas ({conn.table_count})</h5>
                      <div className="cc-db-table-grid">
                        {conn.tables.map((table) => (
                          <div key={table} className="cc-db-table-item">
                            <span className="cc-db-table-icon">⊞</span>
                            <span className="cc-db-table-name">{table}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(!conn.tables || conn.tables.length === 0) && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 0' }}>
                      Tabelas serão descobertas no próximo health check...
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── LIFE AGENT DRILLDOWN (health matrix) ──────────────────────────
function LifeDrilldown({ agent }) {
  const [healthMatrix, setHealthMatrix] = useState([])
  const m = agent.metrics || {}

  useEffect(() => {
    const fetchHealth = async () => {
      const data = await api.getLifeHealth()
      if (data && Array.isArray(data)) setHealthMatrix(data)
    }
    fetchHealth()
    const interval = setInterval(fetchHealth, 15000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (s) => {
    if (s === 'online' || s === 'running') return '#22c55e'
    if (s === 'error') return '#ef4444'
    if (s === 'offline') return '#52525b'
    return '#eab308'
  }

  const getStatusIcon = (s) => {
    if (s === 'online' || s === 'running') return '●'
    if (s === 'error') return '⚠'
    if (s === 'offline') return '○'
    return '◐'
  }

  const getStatusText = (s) => {
    if (s === 'online' || s === 'running') return 'Online'
    if (s === 'error') return 'Erro'
    if (s === 'offline') return 'Offline'
    return s || 'Desconhecido'
  }

  const agents = healthMatrix.filter(h => h.type === 'agent')
  const specialists = healthMatrix.filter(h => h.type === 'specialist')

  return (
    <>
      {/* Summary metrics */}
      <div className="cc-drill-metrics">
        <div className="cc-drill-metric">
          <div className="dm-val" style={{ color: 'var(--accent)' }}>{m.agentsCount || agents.length}</div>
          <div className="dm-lab">Agentes</div>
        </div>
        <div className="cc-drill-metric">
          <div className="dm-val" style={{ color: 'var(--cyan)' }}>{m.specialistsCount || specialists.length}</div>
          <div className="dm-lab">Especialistas</div>
        </div>
        <div className="cc-drill-metric">
          <div className="dm-val" style={{ color: (m.errorsLast24h || 0) > 0 ? 'var(--red)' : 'var(--green)' }}>{m.errorsLast24h || 0}</div>
          <div className="dm-lab">Erros 24h</div>
        </div>
        <div className="cc-drill-metric">
          <div className="dm-val" style={{ color: 'var(--green)' }}>{m.uptimePercent || 100}%</div>
          <div className="dm-lab">Uptime</div>
        </div>
      </div>

      {/* Agents health section */}
      {agents.length > 0 && (
        <div className="cc-drill-section">
          <h4>🤖 Agentes ({agents.length})</h4>
          <div className="cc-life-health-grid">
            {agents.map((h) => (
              <div key={h.agent_id} className="cc-life-health-card">
                <div className="cc-lhc-header">
                  <span className="cc-lhc-status" style={{ color: getStatusColor(h.status) }}>
                    {getStatusIcon(h.status)} {getStatusText(h.status)}
                  </span>
                  {h.last_ping && h.last_ping !== 'never' && h.last_ping !== '—' && (
                    <span className="cc-lhc-ping">{h.last_ping}</span>
                  )}
                </div>
                <div className="cc-lhc-name">{h.name || h.agent_id}</div>
                <div className="cc-lhc-role">{h.role}</div>
                <div className="cc-lhc-stats">
                  {h.response_time_ms > 0 && (
                    <span className="skill-tag" style={{ background: 'rgba(59,130,246,.12)', color: '#3b82f6', fontSize: '11px', padding: '2px 8px' }}>
                      {Math.round(h.response_time_ms)}ms
                    </span>
                  )}
                  {h.last_task && h.last_task !== 'idle' && (
                    <span className="skill-tag" style={{ background: 'rgba(34,197,94,.12)', color: '#22c55e', fontSize: '11px', padding: '2px 8px' }}>
                      {h.last_task}
                    </span>
                  )}
                  {h.consecutive_misses > 0 && (
                    <span className="skill-tag" style={{ background: 'rgba(239,68,68,.12)', color: '#ef4444', fontSize: '11px', padding: '2px 8px' }}>
                      {h.consecutive_misses} miss{h.consecutive_misses > 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specialists health section */}
      {specialists.length > 0 && (
        <div className="cc-drill-section">
          <h4>⚡ Especialistas ({specialists.length})</h4>
          <div className="cc-life-health-grid">
            {specialists.map((h) => (
              <div key={h.agent_id} className="cc-life-health-card">
                <div className="cc-lhc-header">
                  <span className="cc-lhc-status" style={{ color: getStatusColor(h.status) }}>
                    {getStatusIcon(h.status)} {getStatusText(h.status)}
                  </span>
                </div>
                <div className="cc-lhc-name">{h.name || h.agent_id}</div>
                <div className="cc-lhc-role">{h.role}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ─── AGENT DRILLDOWN (detail panel when clicking an agent) ────────
function AgentDrilldown({ agent, events, onClose }) {
  const [expandedEmail, setExpandedEmail] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!agent) return null

  const handleEmailAction = async (action, email) => {
    setIsProcessing(true);
    try {
      if (action === 'delete') {
        await api.sendChatMessage(`Deletar o email de ${email.from} com assunto "${email.subject}"`);
        alert("Solicitação enviada. A caixa de entrada será atualizada na próxima sincronização.");
      } else if (action === 'reply') {
        if (!replyText.trim()) {
          alert("Digite uma resposta");
          return;
        }
        await api.sendChatMessage(`Responder o email de ${email.from} com assunto "${email.subject}" com o seguinte texto: ${replyText}`);
        alert("Resposta enviada. A caixa de entrada será atualizada na próxima sincronização.");
        setReplyText('');
        setExpandedEmail(null);
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao executar ação: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (iso) => iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div className="cc-drilldown fade-in-up">
      <div className="cc-drill-header">
        <div className={`cc-card-icon ${agent.iconClass}`}>{agent.iconEmoji}</div>
        <h3>{agent.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '14px' }}>— {agent.role}</span></h3>
        <StatusBadge status={agent.status} />
        <button className="btn-secondary" onClick={onClose} style={{ padding: '4px 12px', fontSize: '12px' }}>✕</button>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>{agent.description}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
        {(agent.capabilities || []).map(c => <span key={c} className="skill-tag">{c}</span>)}
      </div>

      {/* Token Agent */}
      {agent.id === 'agent-token' && agent.monitorData && (<>
        <div className="cc-drill-metrics">
          <div className="cc-drill-metric"><div className="dm-val" style={{ color: 'var(--purple)' }}>{(agent.monitorData.totalTokens || 0).toLocaleString()}</div><div className="dm-lab">Total Ano</div></div>
          <div className="cc-drill-metric"><div className="dm-val" style={{ color: 'var(--cyan)' }}>{(agent.monitorData.monthlyTokens || 0).toLocaleString()}</div><div className="dm-lab">Este Mês</div></div>
          <div className="cc-drill-metric"><div className="dm-val">{agent.metrics.tokensTrend}</div><div className="dm-lab">Tendência</div></div>
          <div className="cc-drill-metric"><div className="dm-val" style={{ color: 'var(--green)' }}>{agent.metrics.alertsActive}</div><div className="dm-lab">Alertas</div></div>
        </div>
        <div className="cc-drill-section">
          <h4>📊 Ranking de Consumo por Agente</h4>
          <div className="cc-token-ranking">
            {agent.monitorData.perAgent.map((a, i) => {
              const max = Math.max(...agent.monitorData.perAgent.map(x => x.tokens))
              return (
                <div key={i} className="cc-rank-item">
                  <span className="cc-rank-name">{a.name}</span>
                  <span className="cc-rank-val">{a.tokens.toLocaleString()}</span>
                  <div className="cc-rank-bar"><div className="cc-rank-bar-fill" style={{ width: `${(a.tokens / max) * 100}%` }} /></div>
                </div>
              )
            })}
          </div>
        </div>
      </>)}

      {/* BD Agent */}
      {agent.id === 'agent-bd' && (<BDDrilldown agent={agent} />)}

      {/* Life Agent */}
      {agent.id === 'agent-life' && (<LifeDrilldown agent={agent} />)}

      {/* SSO Agent */}
      {agent.id === 'agent-sso' && (<>
        <div className="cc-drill-metrics">
          <div className="cc-drill-metric"><div className="dm-val">{agent.metrics.cpu}%</div><div className="dm-lab">CPU</div></div>
          <div className="cc-drill-metric"><div className="dm-val">{agent.metrics.memory}%</div><div className="dm-lab">Memória</div></div>
          <div className="cc-drill-metric"><div className="dm-val">{agent.metrics.disk}%</div><div className="dm-lab">Disco</div></div>
          <div className="cc-drill-metric"><div className="dm-val">{agent.metrics.ping}</div><div className="dm-lab">Ping</div></div>
          <div className="cc-drill-metric"><div className="dm-val">{agent.metrics.uptime}</div><div className="dm-lab">Uptime</div></div>
        </div>
        {agent.monitorData && (
          <div className="cc-drill-section">
            <h4>🖥️ {agent.monitorData.server} — {agent.monitorData.os}</h4>
            <div className="cc-vps-metrics">
              {[
                { label: 'CPU', value: agent.metrics.cpu },
                { label: 'Memória', value: agent.metrics.memory },
                { label: 'Disco', value: agent.metrics.disk },
              ].map(m => (
                <div key={m.label} className="cc-vps-metric">
                  <div className="vm-top">
                    <span className="vm-label">{m.label}</span>
                    <span className="vm-value">{m.value}%</span>
                  </div>
                  <div className="cc-vps-track">
                    <div className="cc-vps-fill" style={{ width: `${m.value}%`, background: m.value > 80 ? 'var(--red)' : m.value > 60 ? 'var(--amber)' : 'var(--accent)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>)}

      {/* Pendências Specialist */}
      {agent.id === 'spec-pendencias' && agent.extractionData && (<>
        <div className="cc-drill-metrics">
          <div className="cc-drill-metric"><div className="dm-val" style={{ color: 'var(--green)' }}>{agent.extractionData.downloads}</div><div className="dm-lab">Downloads</div></div>
          <div className="cc-drill-metric"><div className="dm-val" style={{ color: 'var(--cyan)' }}>{agent.extractionData.uploads}</div><div className="dm-lab">Uploads</div></div>
          <div className="cc-drill-metric"><div className="dm-val" style={{ color: 'var(--accent)' }}>{agent.extractionData.records.total}</div><div className="dm-lab">Registros</div></div>
          <div className="cc-drill-metric"><div className="dm-val">{agent.extractionData.duration}</div><div className="dm-lab">Duração</div></div>
          <div className="cc-drill-metric"><div className="dm-val" style={{ color: agent.extractionData.errors > 0 ? 'var(--red)' : 'var(--green)' }}>{agent.extractionData.errors}</div><div className="dm-lab">Erros</div></div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span className="skill-tag" style={{ background: 'rgba(245,158,11,.15)', color: '#f59e0b' }}>Vazamento: {agent.extractionData.records.vazamento}</span>
          <span className="skill-tag" style={{ background: 'rgba(59,130,246,.15)', color: '#3b82f6' }}>Pavimento: {agent.extractionData.records.pavimento}</span>
          <span className="skill-tag" style={{ background: 'rgba(6,182,212,.15)', color: '#06b6d4' }}>Falta d'água: {agent.extractionData.records.faltaDagua}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div><strong>Período</strong><br />{agent.extractionData.period}</div>
          <div><strong>Última Execução</strong><br />{formatDate(agent.extractionData.lastRun)}</div>
          <div><strong>Telegram</strong><br />{agent.extractionData.notificationSent ? '✓ Enviada' : '✗ Pendente'}</div>
        </div>
      </>)}

      {/* Email Specialist */}
      {agent.id === 'spec-email' && agent.monitorData && (<>
        <div className="cc-drill-metrics">
          <div className="cc-drill-metric"><div className="dm-val">{agent.metrics.emailsProcessed}</div><div className="dm-lab">Processados</div></div>
          <div className="cc-drill-metric"><div className="dm-val" style={{ color: 'var(--amber)' }}>{agent.metrics.unread}</div><div className="dm-lab">Não Lidos</div></div>
          <div className="cc-drill-metric"><div className="dm-val" style={{ color: 'var(--red)' }}>{agent.metrics.urgentAlerts}</div><div className="dm-lab">Urgentes</div></div>
        </div>
        <div className="cc-drill-section">
          <h4>📧 Inbox Inteligente</h4>
          <div className="cc-db-ops" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {agent.monitorData.inbox.map((email, i) => {
              const isExpanded = expandedEmail === i;
              return (
                <div key={i} className="cc-db-op-item" style={{ display: 'flex', flexDirection: 'column', padding: '12px', cursor: 'pointer', transition: 'all 0.2s', border: isExpanded ? '1px solid var(--accent)' : '1px solid var(--border)', background: isExpanded ? 'rgba(56, 189, 248, 0.03)' : 'var(--bg-card)' }} onClick={() => setExpandedEmail(isExpanded ? null : i)}>
                  <div style={{ display: 'grid', gridTemplateColumns: '46px 1fr auto', gap: '12px', alignItems: 'start' }}>
                    <span className="cc-db-op-time" style={{ marginTop: '2px' }}>{email.time}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: email.read ? 'var(--text-secondary)' : 'var(--text-primary)', fontSize: '13px' }}>{email.subject}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{email.from}</div>
                    </div>
                    <span className={`skill-tag`} style={{
                      background: email.priority === 'urgent' ? 'rgba(239,68,68,.15)' : email.priority === 'normal' ? 'rgba(59,130,246,.15)' : 'rgba(82,82,91,.15)',
                      color: email.priority === 'urgent' ? '#ef4444' : email.priority === 'normal' ? '#3b82f6' : '#71717a',
                      fontSize: '10px',
                    }}>{email.priority === 'urgent' ? '⚠ Urgente' : email.priority === 'normal' ? 'Normal' : 'Info'}</span>
                  </div>
                  {isExpanded && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', cursor: 'default' }} onClick={e => e.stopPropagation()}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto', background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '8px', borderRadius: '4px' }}>
                        {email.body || "(Sem corpo ou resumo disponível)"}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                        <textarea
                          placeholder="Escreva sua resposta para o Agente enviar..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-primary)', resize: 'vertical', minHeight: '60px', fontFamily: 'inherit' }}
                          disabled={isProcessing}
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'transparent' }} onClick={() => handleEmailAction('delete', email)} disabled={isProcessing}>
                            {isProcessing ? '...' : 'Deletar Email'}
                          </button>
                          <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEmailAction('reply', email)} disabled={isProcessing || !replyText.trim()}>
                            {isProcessing ? 'Enviando...' : 'Responder Email'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </>)}

      {/* Schedule Specialist */}
      {agent.id === 'spec-schedule' && agent.monitorData && (<>
        <div className="cc-drill-metrics">
          <div className="cc-drill-metric"><div className="dm-val">{agent.metrics.activeCrons}</div><div className="dm-lab">CRONs</div></div>
          <div className="cc-drill-metric"><div className="dm-val">{agent.metrics.eventsToday}</div><div className="dm-lab">Eventos Hoje</div></div>
        </div>
        <div className="cc-drill-section">
          <h4>⏰ Agendamentos CRON</h4>
          <div className="cc-db-ops">
            {agent.monitorData.crons.map((cron, i) => (
              <div key={i} className="cc-db-op-item" style={{ gridTemplateColumns: '1fr auto auto auto' }}>
                <span style={{ fontWeight: 600 }}>{cron.name}</span>
                <code style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cron.expr}</code>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Próx: {cron.nextRun}</span>
                <span className="cc-db-op-status">{cron.status === 'active' ? '● Ativo' : '○ Parado'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="cc-drill-section">
          <h4>📅 Próximos Eventos</h4>
          <div className="cc-db-ops">
            {agent.monitorData.upcomingEvents.map((ev, i) => (
              <div key={i} className="cc-db-op-item" style={{ gridTemplateColumns: '60px 1fr auto' }}>
                <span style={{ fontWeight: 700, color: ev.urgent ? 'var(--red)' : 'var(--accent)' }}>{ev.time}</span>
                <span>{ev.title}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span className="skill-tag" style={{ background: 'rgba(59,130,246,.15)', color: '#3b82f6', fontSize: '10px' }}>🔔 30min antes</span>
                  {ev.urgent && <span className="skill-tag" style={{ background: 'rgba(239,68,68,.15)', color: '#ef4444', fontSize: '10px' }}>Urgente</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>)}

      {/* Pendencias Specialist */}
      {agent.id === 'spec-pendencias' && (<>
        <div className="cc-drill-metrics">
          <div className="cc-drill-metric"><div className="dm-val">{agent.metrics.totalDownloads || 0}</div><div className="dm-lab">Extrações</div></div>
          <div className="cc-drill-metric"><div className="dm-val">{agent.metrics.uploadsOk || 0}</div><div className="dm-lab">Sucesso</div></div>
          <div className="cc-drill-metric"><div className="dm-val" style={{ color: agent.metrics.uploadsError > 0 ? 'var(--red)' : 'inherit' }}>{agent.metrics.uploadsError || 0}</div><div className="dm-lab">Falhas</div></div>
          <div className="cc-drill-metric"><div className="dm-val">{agent.metrics.lastDuration || '—'}</div><div className="dm-lab">Duração</div></div>
        </div>

        <div className="cc-drill-section" style={{ marginTop: '16px' }}>
          <h4>🎮 Controle de Automação</h4>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            {agent.status === 'offline' ? (
              <button
                className="cc-btn-primary"
                onClick={async () => {
                  const res = await api.controlPendencias('start');
                  alert(res.message);
                  window.location.reload();
                }}
                style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
              >
                ▶ Iniciar Agendador
              </button>
            ) : (
              <button
                className="cc-btn-danger"
                onClick={async () => {
                  const res = await api.controlPendencias('stop');
                  alert(res.message);
                  window.location.reload();
                }}
                style={{ background: 'var(--red)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
              >
                🛑 Parar Agendador
              </button>
            )}

            <button
              className="cc-btn-secondary"
              onClick={async () => {
                const res = await api.controlPendencias('run_once');
                alert(res.message);
              }}
              style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
            >
              🔄 Executar Agora
            </button>
          </div>

          {/* ── Progress Bar ── */}
          {agent.monitorData?.progress_pct != null && agent.status !== 'online' && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                <span>Progresso Geral</span>
                <span style={{ fontWeight: 700, color: agent.monitorData.progress_pct === 100 ? 'var(--green)' : 'var(--accent)' }}>
                  {agent.monitorData.progress_pct}%
                </span>
              </div>
              <div style={{ background: 'var(--surface-3)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${agent.monitorData.progress_pct}%`,
                  background: agent.monitorData.progress_pct === 100
                    ? 'var(--green)'
                    : `linear-gradient(90deg, var(--accent), var(--purple))`,
                  borderRadius: '6px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          )}

          {/* ── Thread Status Table ── */}
          {agent.monitorData?.thread_status && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                🧵 Status das Threads
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {Object.entries(agent.monitorData.thread_status).map(([nome, status]) => {
                  const isOk = status.includes('✅');
                  const isErr = status.includes('❌');
                  const isRunning = status.includes('🔄');
                  const color = isOk ? 'var(--green)' : isErr ? 'var(--red)' : isRunning ? 'var(--accent)' : 'var(--text-muted)';
                  return (
                    <div key={nome} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px', borderRadius: '6px',
                      background: isOk ? 'rgba(34,197,94,0.06)' : isErr ? 'rgba(239,68,68,0.06)' : 'var(--surface-3)',
                      border: `1px solid ${isOk ? 'rgba(34,197,94,0.2)' : isErr ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
                    }}>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{nome}</span>
                      <span style={{ fontSize: '12px', color, fontWeight: 500 }}>{status}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── DB Confirmation Badge ── */}
          {agent.monitorData?.db_confirmed != null && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                background: agent.monitorData.db_confirmed ? 'rgba(34,197,94,0.12)' : 'rgba(82,82,91,0.12)',
                color: agent.monitorData.db_confirmed ? 'var(--green)' : 'var(--text-muted)',
                border: `1px solid ${agent.monitorData.db_confirmed ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
              }}>
                {agent.monitorData.db_confirmed ? '✅ Dados confirmados no Supabase' : '⏳ Aguardando confirmação do banco'}
              </span>
            </div>
          )}

          {/* ── Activity Monitor (detail text) ── */}
          {(agent.status === 'executando' || agent.status === 'running' || agent.status === 'erro' || agent.status === 'error') && (
            <div className="cc-activity-monitor" style={{
              marginTop: '16px',
              padding: '12px',
              background: agent.status === 'erro' || agent.status === 'error' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)',
              borderRadius: '8px',
              borderLeft: `4px solid ${agent.status === 'erro' || agent.status === 'error' ? 'var(--red)' : 'var(--blue)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div className="cc-pulse-dot" style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: agent.status === 'erro' || agent.status === 'error' ? 'var(--red)' : 'var(--blue)',
                animation: 'pulse 2s infinite', flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: agent.status === 'erro' || agent.status === 'error' ? 'var(--red)' : 'var(--blue)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {agent.status === 'erro' || agent.status === 'error' ? 'Falha Detectada' : 'Processando...'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>
                  {agent.status_detail || "Sincronizando..."}
                </div>
              </div>
            </div>
          )}

          {/* ── Success Summary ── */}
          {agent.monitorData?.success_summary && (agent.status === 'online') && (
            <div style={{
              marginTop: '16px', padding: '14px 16px', borderRadius: '10px',
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                📋 Último Resultado
              </div>
              <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                {agent.monitorData.success_summary}
              </pre>
            </div>
          )}
        </div>

        <div className="cc-drill-section" style={{ marginTop: '16px' }}>
          <h4>📅 Próxima Sincronização</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {agent.monitorData?.next_run ? new Date(agent.monitorData.next_run).toLocaleString() : 'Não agendado'}
          </p>
        </div>
      </>)}


      {/* Docs Specialist */}
      {agent.id === 'spec-docs' && (<>
        <div className="cc-drill-metrics">
          <div className="cc-drill-metric"><div className="dm-val">{agent.metrics.docsGenerated || 0}</div><div className="dm-lab">Total Gerados</div></div>
          <div className="cc-drill-metric"><div className="dm-val">{agent.metrics.lastGeneration ? formatDate(agent.metrics.lastGeneration) : '—'}</div><div className="dm-lab">Último</div></div>
          <div className="cc-drill-metric"><div className="dm-val">{agent.metrics.successRate || 100}%</div><div className="dm-lab">Sucesso</div></div>
        </div>
        {agent.metrics.byType && Object.keys(agent.metrics.byType).length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0' }}>
            {Object.entries(agent.metrics.byType).map(([type, count]) => (
              <div key={type} style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
              }}>
                {type === 'pdf' ? '📕' : type === 'docx' ? '📘' : type === 'pptx' ? '📊' : type === 'xlsx' ? '📗' : '📄'}{' '}
                {type.toUpperCase()}: {count}
              </div>
            ))}
          </div>
        )}
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Geração inteligente de documentos via IA. Acesse o menu <strong>Documentos</strong> para criar, visualizar templates e baixar arquivos.
        </p>
      </>)}

      {/* Events for this agent */}
      {events.length > 0 && (
        <div className="cc-drill-section" style={{ marginTop: '16px' }}>
          <h4>📋 Eventos Recentes</h4>
          <div className="cc-db-ops">
            {events.map((ev, i) => (
              <div key={i} className="cc-db-op-item" style={{ gridTemplateColumns: '46px 28px 1fr' }}>
                <span className="cc-db-op-time">{ev.time}</span>
                <span className={`cc-event-type-icon ${ev.type}`}>{EVENT_TYPES[ev.type]?.icon || '●'}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{ev.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── OPENROUTER SHOWCASE (Featured Models + Agents) ────────────────
function OpenRouterShowcase() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)

  // Featured AI Agents (curated — not from API)
  const featuredAgents = [
    {
      name: 'Caio Corp',
      description: 'Plataforma de agentes inteligentes para automação corporativa',
      icon: '🤖',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      tags: ['Multi-Agent', 'Automação', 'Dashboard'],
      url: null,
    },
    {
      name: 'Replit Agent',
      description: 'Build full-stack apps from idea to deployment',
      icon: '🔶',
      gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
      tags: ['Full-Stack', 'Deploy', 'AI Coding'],
      url: 'https://replit.com',
    },
    {
      name: 'Kilo Code',
      description: 'Everything you need for agentic development',
      icon: '⚡',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      tags: ['VSCode', 'Agentic', 'Multi-Model'],
      url: 'https://kilocode.ai',
    },
    {
      name: 'OpenRouter Chat',
      description: 'Acesse 300+ modelos com uma única interface',
      icon: '💬',
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      tags: ['Chat', '300+ Models', 'Free Tier'],
      url: 'https://openrouter.ai/chat',
    },
  ]

  // Provider logo mapping
  const providerIcons = {
    'anthropic': '🅰️',
    'openai': '🟢',
    'google': '🔵',
    'meta-llama': '🦙',
    'mistralai': '🌊',
    'deepseek': '🔮',
    'arcee-ai': '⚡',
    'cohere': '🟠',
    'qwen': '🟣',
    'nvidia': '💚',
  }

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/models')
        const data = await res.json()
        if (data?.data) {
          // Sort by most recent / trending and pick top 6
          const sorted = data.data
            .filter(m => m.name && m.pricing)
            .sort((a, b) => (b.created || 0) - (a.created || 0))
            .slice(0, 6)
            .map(m => {
              const provider = m.id.split('/')[0] || 'unknown'
              const promptPrice = parseFloat(m.pricing?.prompt || '0') * 1_000_000
              const completionPrice = parseFloat(m.pricing?.completion || '0') * 1_000_000
              const contextK = Math.round((m.context_length || 0) / 1000)
              // Simulate weekly trend (API doesn't provide this)
              const trend = (Math.random() * 20 - 8).toFixed(1)
              return {
                id: m.id,
                name: m.name,
                provider,
                providerIcon: providerIcons[provider] || '🤖',
                promptPrice: promptPrice < 0.01 ? 'Free' : `$${promptPrice.toFixed(2)}`,
                completionPrice: completionPrice < 0.01 ? 'Free' : `$${completionPrice.toFixed(2)}`,
                contextK: contextK > 0 ? `${contextK}K` : '—',
                trend: parseFloat(trend),
                modality: m.architecture?.modality || 'text→text',
                description: (m.description || '').slice(0, 120),
              }
            })
          setModels(sorted)
        }
      } catch (err) {
        console.warn('OpenRouter API fetch failed:', err)
        // Fallback data
        setModels([
          { id: 'anthropic/claude-4-opus', name: 'Claude Opus 4', provider: 'anthropic', providerIcon: '🅰️', promptPrice: '$15.00', completionPrice: '$75.00', contextK: '200K', trend: -8.6, modality: 'text→text', description: 'Most powerful model for complex reasoning and analysis' },
          { id: 'google/gemini-3-pro', name: 'Gemini 3 Pro', provider: 'google', providerIcon: '🔵', promptPrice: '$1.25', completionPrice: '$5.00', contextK: '1000K', trend: 12.3, modality: 'text+image→text', description: 'Multimodal model with massive context window' },
          { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'deepseek', providerIcon: '🔮', promptPrice: '$0.55', completionPrice: '$2.19', contextK: '64K', trend: 45.2, modality: 'text→text', description: 'Advanced reasoning with chain-of-thought capability' },
          { id: 'openai/gpt-4.1', name: 'GPT-4.1', provider: 'openai', providerIcon: '🟢', promptPrice: '$2.00', completionPrice: '$8.00', contextK: '1000K', trend: -2.3, modality: 'text+image→text', description: 'Latest GPT model with improved coding and reasoning' },
          { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', provider: 'meta-llama', providerIcon: '🦙', promptPrice: '$0.20', completionPrice: '$0.60', contextK: '1000K', trend: 28.7, modality: 'text+image→text', description: 'Open-source powerhouse for diverse applications' },
          { id: 'arcee-ai/trinity-large', name: 'Trinity Large', provider: 'arcee-ai', providerIcon: '⚡', promptPrice: 'Free', completionPrice: 'Free', contextK: '32K', trend: -1.5, modality: 'text→text', description: 'Free, fast model for general-purpose tasks' },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchModels()
    // Refresh every 5 minutes
    const interval = setInterval(fetchModels, 300000)
    return () => clearInterval(interval)
  }, [])

  const getTrendColor = (t) => t > 0 ? '#22c55e' : t < -5 ? '#ef4444' : '#eab308'
  const getTrendIcon = (t) => t > 0 ? '↑' : t < -5 ? '↓' : '→'

  return (
    <div className="cc-openrouter-showcase fade-in-up fade-in-up-delay-2">
      {/* Featured Models */}
      <div className="cc-or-section">
        <div className="cc-or-section-header">
          <div className="cc-or-title-group">
            <h3>
              <span className="cc-or-logo">◆</span>
              Modelos em Destaque
            </h3>
            <p>300+ modelos ativos em 60+ provedores via <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="cc-or-link">OpenRouter</a></p>
          </div>
          <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" className="cc-or-viewall">
            Ver todos →
          </a>
        </div>
        <div className="cc-or-models-grid">
          {loading ? (
            <div className="cc-or-loading">
              <div className="cc-or-spinner" />
              Carregando modelos...
            </div>
          ) : (
            models.map((model) => (
              <a
                key={model.id}
                href={`https://openrouter.ai/models/${model.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cc-or-model-card"
              >
                <div className="cc-or-model-top">
                  <span className="cc-or-model-icon">{model.providerIcon}</span>
                  <div className="cc-or-model-info">
                    <div className="cc-or-model-name">{model.name}</div>
                    <div className="cc-or-model-provider">by {model.provider}</div>
                  </div>
                </div>
                <div className="cc-or-model-stats">
                  <div className="cc-or-model-stat">
                    <span className="cc-or-stat-label">Input/1M</span>
                    <span className="cc-or-stat-value">{model.promptPrice}</span>
                  </div>
                  <div className="cc-or-model-stat">
                    <span className="cc-or-stat-label">Contexto</span>
                    <span className="cc-or-stat-value">{model.contextK}</span>
                  </div>
                  <div className="cc-or-model-stat">
                    <span className="cc-or-stat-label">Trend</span>
                    <span className="cc-or-stat-value" style={{ color: getTrendColor(model.trend) }}>
                      {getTrendIcon(model.trend)} {Math.abs(model.trend)}%
                    </span>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      </div>

      {/* Featured Agents */}
      <div className="cc-or-section">
        <div className="cc-or-section-header">
          <div className="cc-or-title-group">
            <h3>
              <span className="cc-or-logo">⚡</span>
              Featured Agents
            </h3>
            <p>Agentes e plataformas de IA para automação e desenvolvimento</p>
          </div>
        </div>
        <div className="cc-or-agents-grid">
          {featuredAgents.map((agent) => (
            <div
              key={agent.name}
              className="cc-or-agent-card"
              onClick={() => agent.url && window.open(agent.url, '_blank')}
              style={{ cursor: agent.url ? 'pointer' : 'default' }}
            >
              <div className="cc-or-agent-banner" style={{ background: agent.gradient }}>
                <span className="cc-or-agent-icon">{agent.icon}</span>
              </div>
              <div className="cc-or-agent-body">
                <div className="cc-or-agent-name">{agent.name}</div>
                <div className="cc-or-agent-desc">{agent.description}</div>
                <div className="cc-or-agent-tags">
                  {agent.tags.map(t => (
                    <span key={t} className="cc-or-agent-tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN DASHBOARD PAGE ──────────────────────────────────────────
export default function DashboardPage({ onNavigate }) {
  const [agents, setAgents] = useState([])
  const [events, setEvents] = useState([])
  const [services, setServices] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)

  const fetchAll = useCallback(async () => {
    const [a, e, s] = await Promise.all([api.getAgents(), api.getEvents(), api.getServices()])
    setAgents(a)
    setEvents(e)
    setServices(s)
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30000)
    return () => clearInterval(interval)
  }, [fetchAll])

  const ceo = agents.find(a => a.tier === 0)
  const tier1 = agents.filter(a => a.tier === 1)
  const tier2 = agents.filter(a => a.tier === 2)
  const drillAgent = agents.find(a => a.id === selectedAgent)
  const drillEvents = events.filter(e => e.agentId === selectedAgent)
  const onlineCount = agents.filter(a => a.status === 'online' || a.status === 'executando').length

  const handleAgentClick = (id) => {
    setSelectedAgent(prev => prev === id ? null : id)
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-header fade-in-up">
        <h2>Centro de Inteligência Operacional</h2>
        <p>Hierarquia de agentes, eventos em tempo real e controle de automações.</p>
      </div>

      {/* System Status Strip */}
      <div className="cc-system-strip fade-in-up">
        {services.map(svc => (
          <div key={svc.id} className="cc-strip-item">
            <span className={`cc-strip-dot ${svc.status}`} />
            <span className="cc-strip-name">{svc.name}</span>
            <span className="cc-strip-val">{svc.response || '—'}</span>
          </div>
        ))}
        <div className="cc-strip-item" style={{ marginLeft: 'auto' }}>
          <span className="cc-strip-name">Agentes Online</span>
          <span className="cc-strip-val" style={{ color: 'var(--green)' }}>{onlineCount}/{agents.length}</span>
        </div>
      </div>

      {/* ── HIERARCHY VISUALIZATION ── */}
      <div className="cc-hierarchy fade-in-up fade-in-up-delay-1">
        {/* CEO card */}
        {ceo && (
          <div className="cc-ceo-card" onClick={() => handleAgentClick(ceo.id)}>
            <div className="cc-ceo-icon">{ceo.iconEmoji}</div>
            <div className="cc-ceo-info">
              <h3>{ceo.name}</h3>
              <div className="cc-role">{ceo.role}</div>
              <div className="cc-desc">Coordena {agents.length - 1} agentes · {ceo.metrics?.tasksCompleted || 0} tarefas concluídas</div>
            </div>
            <StatusBadge status={ceo.status} />
          </div>
        )}

        {/* Connector */}
        <div className="cc-connector" />
        <div className="cc-fan-line" />

        {/* Tier 1 Label */}
        <div className="cc-tier-label">Camada de Agentes — Infraestrutura & Monitoramento</div>

        {/* Tier 1 Cards */}
        <div className="cc-agents-row tier-1">
          {tier1.map(agent => (
            <AgentCard key={agent.id} agent={agent} selected={selectedAgent === agent.id} onClick={handleAgentClick} />
          ))}
        </div>

        {/* Connector */}
        <div className="cc-connector" />
        <div className="cc-fan-line" />

        {/* Tier 2 Label */}
        <div className="cc-tier-label">Camada de Especialistas — Execução de Tarefas</div>

        {/* Tier 2 Cards */}
        <div className="cc-agents-row tier-2">
          {tier2.map(agent => (
            <AgentCard key={agent.id} agent={agent} selected={selectedAgent === agent.id} onClick={handleAgentClick} />
          ))}
        </div>
      </div>

      {/* ── DRILLDOWN ── */}
      {drillAgent && (
        <AgentDrilldown agent={drillAgent} events={drillEvents} onClose={() => setSelectedAgent(null)} />
      )}

      {/* ── BOTTOM: OpenRouter Showcase ── */}
      <OpenRouterShowcase />
    </>
  )
}
