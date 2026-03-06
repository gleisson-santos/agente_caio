import { useState, useEffect, useCallback } from 'react'
import { api, STATUS_CONFIG, EVENT_TYPES } from '../services/api'

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.offline
  return (
    <span className={`cc-status ${status}`}>
      <span className="cc-status-dot" />
      {cfg.label}
    </span>
  )
}

export default function AgentsPage({ focusAgent }) {
  const [agents, setAgents] = useState([])
  const [events, setEvents] = useState([])
  const [selected, setSelected] = useState(focusAgent || null)

  const fetchData = useCallback(async () => {
    const [a, e] = await Promise.all([api.getAgents(), api.getEvents()])
    setAgents(a)
    setEvents(e)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { if (focusAgent) setSelected(focusAgent) }, [focusAgent])

  const ceo = agents.find(a => a.tier === 0)
  const tier1 = agents.filter(a => a.tier === 1)
  const tier2 = agents.filter(a => a.tier === 2)
  const selAgent = agents.find(a => a.id === selected)
  const selEvents = events.filter(e => e.agentId === selected)

  const formatDate = (iso) => iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <>
      <div className="page-header fade-in-up">
        <h2>Agentes & Especialistas</h2>
        <p>Hierarquia completa, métricas de performance e detalhamento por agente.</p>
      </div>

      <div className="cc-hierarchy fade-in-up" style={{ marginBottom: '16px' }}>
        {/* CEO */}
        {ceo && (
          <div className={`cc-ceo-card ${selected === ceo.id ? 'selected' : ''}`} onClick={() => setSelected(selected === ceo.id ? null : ceo.id)} style={{ border: selected === ceo.id ? '1px solid var(--accent)' : undefined }}>
            <div className="cc-ceo-icon">{ceo.iconEmoji}</div>
            <div className="cc-ceo-info">
              <h3>{ceo.name}</h3>
              <div className="cc-role">{ceo.role}</div>
              <div className="cc-desc">{ceo.description}</div>
            </div>
            <StatusBadge status={ceo.status} />
          </div>
        )}
        <div className="cc-connector" />
        <div className="cc-fan-line" />
        <div className="cc-tier-label">Camada de Agentes</div>
        <div className="cc-agents-row tier-1">
          {tier1.map(a => (
            <div key={a.id} className={`cc-agent-card ${selected === a.id ? 'selected' : ''}`} onClick={() => setSelected(selected === a.id ? null : a.id)}>
              <div className="cc-card-top">
                <div className={`cc-card-icon ${a.iconClass}`}>{a.iconEmoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}><div className="cc-card-name">{a.name}</div><div className="cc-card-role">{a.role}</div></div>
                <StatusBadge status={a.status} />
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {(a.capabilities || []).slice(0, 3).map(c => <span key={c} className="skill-tag">{c}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div className="cc-connector" />
        <div className="cc-fan-line" />
        <div className="cc-tier-label">Camada de Especialistas</div>
        <div className="cc-agents-row tier-2">
          {tier2.map(a => (
            <div key={a.id} className={`cc-agent-card ${selected === a.id ? 'selected' : ''} ${a.comingSoon ? 'coming-soon' : ''}`} onClick={() => !a.comingSoon && setSelected(selected === a.id ? null : a.id)}>
              {a.comingSoon && <span className="cc-coming-soon">Em breve</span>}
              <div className="cc-card-top">
                <div className={`cc-card-icon ${a.iconClass}`}>{a.iconEmoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}><div className="cc-card-name">{a.name}</div><div className="cc-card-role">{a.role}</div></div>
                <StatusBadge status={a.status} />
              </div>
              {a.statusDetail && <span className="skill-tag" style={{ fontSize: '10px', marginTop: '4px' }}>{a.statusDetail}</span>}
              {a.monitorProject && <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{a.monitorProject}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selAgent && (
        <div className="cc-drilldown fade-in-up">
          <div className="cc-drill-header">
            <div className={`cc-card-icon ${selAgent.iconClass}`}>{selAgent.iconEmoji}</div>
            <h3>{selAgent.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '14px' }}>— {selAgent.role}</span></h3>
            <StatusBadge status={selAgent.status} />
            <button className="btn-secondary" onClick={() => setSelected(null)} style={{ padding: '4px 12px', fontSize: '12px' }}>✕</button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>{selAgent.description}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {(selAgent.capabilities || []).map(c => <span key={c} className="skill-tag">{c}</span>)}
          </div>

          {/* Metrics */}
          {selAgent.metrics && Object.keys(selAgent.metrics).length > 0 && (
            <div className="cc-drill-metrics">
              {Object.entries(selAgent.metrics).map(([key, val]) => (
                <div key={key} className="cc-drill-metric">
                  <div className="dm-val">{typeof val === 'string' && val.includes('T') ? formatDate(val) : String(val)}</div>
                  <div className="dm-lab">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                </div>
              ))}
            </div>
          )}

          {/* Extraction data for specialists */}
          {selAgent.extractionData && (
            <div style={{ marginTop: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>⚡ Dados da Extração</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="skill-tag" style={{ background: 'rgba(245,158,11,.15)', color: '#f59e0b' }}>Vazamento: {selAgent.extractionData.records?.vazamento}</span>
                <span className="skill-tag" style={{ background: 'rgba(59,130,246,.15)', color: '#3b82f6' }}>Pavimento: {selAgent.extractionData.records?.pavimento}</span>
                <span className="skill-tag" style={{ background: 'rgba(6,182,212,.15)', color: '#06b6d4' }}>Falta d'água: {selAgent.extractionData.records?.faltaDagua}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Período: {selAgent.extractionData.period} · Telegram: {selAgent.extractionData.notificationSent ? '✓ Enviada' : '✗ Pendente'}
              </div>
            </div>
          )}

          {/* Events */}
          {selEvents.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>📋 Eventos Recentes</h4>
              <div className="cc-db-ops">
                {selEvents.map((ev, i) => (
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
      )}
    </>
  )
}
