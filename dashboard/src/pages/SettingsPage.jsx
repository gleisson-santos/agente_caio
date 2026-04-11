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

        <div className="settings-section fade-in-up fade-in-up-delay-1">
          <div className="settings-section-title">📡 Canais de Comunicação</div>
          {[
            { key: 'telegramEnabled', label: 'Telegram', desc: 'Receber e enviar mensagens via @CaioAgentbot' },
            { key: 'emailEnabled', label: 'Email (IMAP/SMTP)', desc: 'Monitor de e-mails com análise e resumos' },
            { key: 'whatsappEnabled', label: 'WhatsApp', desc: 'Integração oficial via Evolution API' },
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

        {/* AI Providers */}
        <div className="settings-section fade-in-up fade-in-up-delay-2">
          <div className="settings-section-title">🔌 Provedores de LLM</div>
          <div className="providers-grid">
            {settings.providerKeys && Object.keys(settings.providerKeys).map(p => (
              <div key={p} className="provider-card">
                <div className="provider-header">
                  <span>{p === 'openai' ? '🌐' : p === 'anthropic' ? '🎭' : p === 'google' || p === 'gemini' ? '💎' : p === 'groq' ? '⚡' : '🔌'}</span>
                  {p}
                </div>
                <div className="form-group">
                  <label>API Key</label>
                  <input 
                    type="password" 
                    value={settings.providerKeys[p]} 
                    onChange={e => {
                      const newKeys = { ...settings.providerKeys, [p]: e.target.value };
                      setSettings({ ...settings, providerKeys: newKeys });
                    }} 
                    placeholder={`Sua chave para ${p}`}
                  />
                </div>
                {p === 'custom' && (
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label>Base URL</label>
                    <input 
                      value={settings.providerBases[p]} 
                      onChange={e => {
                        const newBases = { ...settings.providerBases, [p]: e.target.value };
                        setSettings({ ...settings, providerBases: newBases });
                      }} 
                      placeholder="https://api.openai.com/v1"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="form-group" style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <label>Brave Search Key (Extração Web)</label>
            <input 
              type="password" 
              value={settings.braveKey} 
              onChange={e => setSettings({ ...settings, braveKey: e.target.value })} 
              placeholder="Chave para busca na web"
            />
          </div>
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
