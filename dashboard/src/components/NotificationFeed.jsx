import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function NotificationFeed() {
  const [notifications, setNotifications] = useState([])
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    // Load activities as notifications
    api.getActivities().then(acts => {
      const notifs = acts.map((a, i) => ({
        id: a.id || i,
        agent: a.agent,
        type: a.type,
        preview: a.message,
        time: a.time || '—',
        unread: i < 2,
      }))
      setNotifications(notifs)
    })
  }, [])

  const unreadCount = notifications.filter(n => n.unread).length

  const typeIcon = {
    success: '✓',
    info: 'ℹ',
    warning: '⚠',
    error: '✗',
  }

  return (
    <div className="notification-feed">
      <div className="notification-header">
        <h3>
          Notificações
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </h3>
      </div>
      <div className="notification-list">
        {notifications.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Nenhuma notificação recente.
          </div>
        )}
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`notification-item ${notif.unread ? 'unread' : ''}`}
            onClick={() => setExpandedId(expandedId === notif.id ? null : notif.id)}
          >
            <div className="notif-main">
              <span className={`activity-badge ${notif.type}`} style={{ flexShrink: 0 }}>
                {typeIcon[notif.type] || 'ℹ'}
              </span>
              <div className="notif-content">
                <div className="notif-agent">{notif.agent}</div>
                <div className="notif-preview">{notif.preview}</div>
              </div>
              <span className="notif-time">{notif.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
