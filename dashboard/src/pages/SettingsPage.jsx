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

  if (!settings) return (
    <div className="flex h-full items-center justify-center text-muted-foreground animate-pulse">
      Carregando configurações...
    </div>
  )

  if (settings.status === 'error') return (
    <div className="flex h-full items-center justify-center text-destructive">
      <div className="text-center bg-destructive/10 p-6 rounded-lg border border-destructive/20">
        <h3 className="text-lg font-bold mb-2 text-destructive">Erro de Conexão</h3>
        <p>Não foi possível conectar ao backend local.</p>
        <p className="text-sm opacity-80 mt-1">Certifique-se de que o <b>caiocore gateway</b> está rodando.</p>
      </div>
    </div>
  )

  const Switch = ({ checked, onChange }) => (
    <button 
      type="button"
      role="switch" 
      aria-checked={checked}
      onClick={onChange}
      className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-primary' : 'bg-input'}`}
    >
      <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )

  const inputClass = "flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  const labelClass = "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1.5 block"

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Configurações</h2>
        <p className="text-muted-foreground mt-1 text-sm">Modelo de IA, canais de comunicação e preferências do sistema.</p>
      </div>

      <div className="space-y-4 w-full pb-4">
        
        {/* AI Model */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <h3 className="text-lg font-semibold flex items-center gap-2">🤖 Modelo de IA</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Modelo</label>
                <input className={inputClass} value={settings.model || ''} onChange={e => setSettings({ ...settings, model: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Nome do Bot</label>
                <input className={inputClass} value={settings.botName || ''} onChange={e => setSettings({ ...settings, botName: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Max Tokens</label>
                <input className={inputClass} type="number" value={settings.maxTokens || 0} onChange={e => setSettings({ ...settings, maxTokens: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Temperatura</label>
                <input className={inputClass} type="number" step="0.1" min="0" max="2" value={settings.temperature || 0} onChange={e => setSettings({ ...settings, temperature: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
        </div>

        {/* Channels */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="px-3 py-2 border-b border-border bg-muted/20">
            <h3 className="text-sm font-semibold flex items-center gap-2">📡 Canais de Comunicação</h3>
          </div>
          <div className="p-3 space-y-3">
            
            {/* Telegram */}
            <div className="pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-medium">Telegram</h4>
                    <p className="text-xs text-muted-foreground">Receber e enviar mensagens via @seu_bot</p>
                  </div>
                <Switch checked={settings.telegramEnabled} onChange={() => setSettings({ ...settings, telegramEnabled: !settings.telegramEnabled })} />
              </div>
              {settings.telegramEnabled && (
                <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1">
                    <label className={labelClass}>Bot Token</label>
                    <input className={inputClass} type="password" value={settings.telegramToken || ''} onChange={e => setSettings({ ...settings, telegramToken: e.target.value })} placeholder="12345:ABC..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={labelClass}>IDs Permitidos (separados por vírgula)</label>
                      <input className={inputClass} value={settings.telegramAllowList || ''} onChange={e => setSettings({ ...settings, telegramAllowList: e.target.value })} placeholder="12345678, 87654321" />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>ID de Notificações (Notify ID)</label>
                      <input className={inputClass} value={settings.telegramNotifyChatId || ''} onChange={e => setSettings({ ...settings, telegramNotifyChatId: e.target.value })} placeholder="12345678" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium">Email (IMAP/SMTP)</h4>
                  <p className="text-xs text-muted-foreground">Monitor de e-mails com reumos automáticos</p>
                </div>
                <Switch checked={settings.emailEnabled} onChange={() => setSettings({ ...settings, emailEnabled: !settings.emailEnabled })} />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium">WhatsApp (Nativo)</h4>
                  <p className="text-xs text-muted-foreground">Integração oficial via Evolution API</p>
                </div>
                <Switch checked={settings.whatsappEnabled} onChange={() => setSettings({ ...settings, whatsappEnabled: !settings.whatsappEnabled })} />
              </div>
              {settings.whatsappEnabled && (
                <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className={labelClass}>Evolution API Base URL</label>
                    <input className={inputClass} value={settings.evolutionBaseUrl || ''} onChange={e => setSettings({ ...settings, evolutionBaseUrl: e.target.value })} placeholder="https://evolution.seuservidor.com" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={labelClass}>API Key</label>
                      <input className={inputClass} type="password" value={settings.evolutionApiKey || ''} onChange={e => setSettings({ ...settings, evolutionApiKey: e.target.value })} placeholder="Chave global ou da instância" />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Nome da Instância</label>
                      <input className={inputClass} value={settings.evolutionInstance || ''} onChange={e => setSettings({ ...settings, evolutionInstance: e.target.value })} placeholder="CaioAgent" />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* AI Providers */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <h3 className="text-lg font-semibold flex items-center gap-2">🔌 Provedores de LLM</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {settings.providerKeys && Object.keys(settings.providerKeys).map(p => (
                <div key={p} className="p-3 rounded-lg bg-background border border-border transition-colors hover:border-primary/50 group">
                  <div className="text-xs font-semibold mb-2 flex items-center gap-1.5 capitalize text-foreground group-hover:text-primary transition-colors">
                    <span>{p === 'openai' ? '🌐' : p === 'anthropic' ? '🎭' : p === 'google' || p === 'gemini' ? '💎' : p === 'groq' ? '⚡' : '🔌'}</span>
                    {p}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">API Key</label>
                    <input 
                      className={inputClass}
                      type="password" 
                      value={settings.providerKeys[p] || ''} 
                      onChange={e => setSettings({ ...settings, providerKeys: { ...settings.providerKeys, [p]: e.target.value } })} 
                      placeholder={`Sua chave para ${p}`}
                    />
                  </div>
                  {p === 'custom' && (
                    <div className="space-y-1.5 mt-2 pt-2 border-t border-border">
                      <label className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">Base URL</label>
                      <input 
                        className={inputClass}
                        value={settings.providerBases?.[p] || ''} 
                        onChange={e => setSettings({ ...settings, providerBases: { ...settings.providerBases, [p]: e.target.value } })} 
                        placeholder="https://api.example.com/v1"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border" />
            <div className="space-y-2 max-w-sm">
              <label className={labelClass}>Brave Search Key (Busca Web)</label>
              <input 
                className={inputClass}
                type="password" 
                value={settings.braveKey || ''} 
                onChange={e => setSettings({ ...settings, braveKey: e.target.value })} 
                placeholder="Chave para busca nativa na web"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-start">
          <button 
            className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-6 py-1 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"  
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Salvando...
              </span>
            ) : 'Salvar Alterações'}
          </button>
        </div>

      </div>
    </div>
  )
}
