const statusConfig = {
  online: { label: 'Online', color: 'var(--green)', dot: 'var(--green)' },
  busy: { label: 'Ocupado', color: 'var(--amber)', dot: 'var(--amber)' },
  idle: { label: 'Disponível', color: 'var(--text-secondary)', dot: 'var(--text-muted)' },
  offline: { label: 'Offline', color: 'var(--text-muted)', dot: 'var(--text-muted)' },
}

export default function StatusBadge({ status }) {
  const { label, color, dot } = statusConfig[status] || statusConfig.offline
  return (
    <span className={`agent-status ${status}`}>
      <span className="dot" style={{ background: dot }} />
      <span style={{ color }}>{label}</span>
    </span>
  )
}
