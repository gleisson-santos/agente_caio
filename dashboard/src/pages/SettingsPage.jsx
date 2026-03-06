import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function SettingsPage() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getSettings().then(setSettings)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await api.updateSettings(settings)
    setSaving(false)
  }

  const toggleChannel = (channel) => {
    setSettings(prev => ({ ...prev, [channel]: !prev[channel] }))
  }

  if (!settings) return <div className="loading-state">Carregando configurações...</div>

  return (
    <>
      <div className="page-header fade-in-up">
        <h2>Configurações</h2>
        <p>Modelo de IA, canais de comunicação e preferências do sistema.</p>
      </div>

      <div className="settings-content">
        {/* AI Model */}
        <div className="settings-section fade-in-up">
          <div className="settings-section-title">🤖 Modelo de IA</div>
          <div className="settings-grid">
            <div className="form-group">
              <label>Modelo</label>
              <input value={settings.model} onChange={e => setSettings({ ...settings, model: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Nome do Bot</label>
              <input value={settings.botName} onChange={e => setSettings({ ...settings, botName: e.target.value })} />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: '12px' }}>
            <div className="form-group">
              <label>Max Tokens</label>
              <input type="number" value={settings.maxTokens} onChange={e => setSettings({ ...settings, maxTokens: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="form-group">
              <label>Temperature</label>
              <input type="number" step="0.1" min="0" max="2" value={settings.temperature} onChange={e => setSettings({ ...settings, temperature: parseFloat(e.target.value) || 0 })} />
            </div>
            <div />
          </div>
        </div>

        {/* Channels */}
        <div className="settings-section fade-in-up fade-in-up-delay-1">
          <div className="settings-section-title">📡 Canais de Comunicação</div>
          {[
            { key: 'telegramEnabled', label: 'Telegram', desc: 'Receber e enviar mensagens via @CaioAgentbot' },
            { key: 'emailEnabled', label: 'Email (IMAP/SMTP)', desc: 'Monitor de e-mails com análise e resumos' },
            { key: 'whatsappEnabled', label: 'WhatsApp', desc: 'Integração via Evolution API (em desenvolvimento)' },
          ].map(ch => (
            <div key={ch.key} className="toggle-row">
              <div>
                <div className="toggle-label">{ch.label}</div>
                <div className="toggle-desc">{ch.desc}</div>
              </div>
              <div className={`toggle-switch ${settings[ch.key] ? 'active' : ''}`} onClick={() => toggleChannel(ch.key)} />
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="fade-in-up fade-in-up-delay-2" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </>
  )
}
