import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../services/api'

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
    <div className="w-full bg-[#0a0a0A] border border-white/10 rounded-xl overflow-hidden flex flex-col h-[500px]">
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2 font-medium text-white/90">
          <span>🧠</span> Thought Stream
        </div>
        <div className="flex items-center gap-2 text-xs text-green-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Broadcast
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-white/30 text-sm">
            Aguardando sinal dos agentes...
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="text-xs text-white/40 pt-1 shrink-0">{new Date(m.timestamp).toLocaleTimeString()}</div>
            <div className={`p-3 rounded-lg flex-1 border ${m.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-100' : 'bg-white/5 border-white/10 text-white/80'}`}>
               <div className="flex items-center gap-2 mb-1">
                 <span className="text-xs font-bold text-violet-400">@{m.agent_id}</span>
                 <span className="text-[10px] uppercase tracking-wider text-white/50 bg-white/10 px-2 py-0.5 rounded">{m.step || m.type}</span>
               </div>
               <div className="text-sm whitespace-pre-wrap">{m.content || (m.type === 'run_complete' ? 'Interação finalizada' : '')}</div>
               {m.metadata && Object.keys(m.metadata).length > 0 && (
                 <pre className="mt-2 p-2 bg-black/50 rounded text-xs text-white/50 overflow-x-auto">
                   {JSON.stringify(m.metadata, null, 2)}
                 </pre>
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
  { time: '13:47:42', level: 'info', msg: 'API: Telegram notification sent: Evento Agendado' },
  { time: '13:47:40', level: 'info', msg: 'E-mail check complete: 0 novas mensagens' },
  { time: '13:46:30', level: 'info', msg: '[EXPORT] Download concluído: 3 CSVs' },
  { time: '13:45:20', level: 'info', msg: 'Telegram bot @CaioAgentbot connected' },
  { time: '13:45:19', level: 'info', msg: 'Uvicorn running on http://0.0.0.0:18790' },
  { time: '13:45:18', level: 'info', msg: 'Starting Telegram bot (polling mode)...' },
  { time: '13:45:17', level: 'info', msg: 'Starting email channel...' },
  { time: '13:45:16', level: 'debug', msg: 'Agent Caio initialized — model: gemini/gemini-2.0-flash' },
  { time: '13:45:15', level: 'info', msg: 'Gateway starting — caio v3.0' },
]

export default function MonitorPage() {
  const [agents, setAgents] = useState([])
  const [services, setServices] = useState([])
  const [traces, setTraces] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  const fetchData = useCallback(async () => {
    const [a, s, t] = await Promise.all([api.getAgents(), api.getServices(), api.getTracingLogs()])
    setAgents(a || [])
    setServices(s || [])
    setTraces(t || [])
  }, [])

  useEffect(() => {
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
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="mb-2">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Monitor do Sistema</h2>
        <p className="text-white/60 text-sm">Saúde, consumo de tokens, alertas e logs em tempo real.</p>
      </div>

      <div className="flex gap-4 border-b border-white/10">
        <button 
          className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'overview' ? 'border-primary text-white' : 'border-transparent text-white/50 hover:text-white/80'}`} 
          onClick={() => setActiveTab('overview')}
        >
          Overview (Infra)
        </button>
        <button 
          className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'tracing' ? 'border-primary text-white' : 'border-transparent text-white/50 hover:text-white/80'}`} 
          onClick={() => setActiveTab('tracing')}
        >
          Agent Tracing (Logs IA)
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-4">
          {/* Services */}
          <div>
            <h3 className="text-sm font-medium text-white mb-2">Serviços Ativos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {services.map(svc => (
                <div key={svc.id} className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-start gap-3 hover:border-white/20 transition-colors">
                  <span className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                    svc.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                    svc.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <div className="font-semibold text-white/90">{svc.name}</div>
                    <div className="text-xs text-white/50 mt-1">
                      {svc.response} {svc.port ? `· :${svc.port}` : ''} {svc.uptime ? `· ${svc.uptime}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* VPS Health Formatted */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm">🖥️</div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90">Saúde do Servidor (SSO)</h3>
                  <p className="text-[10px] uppercase tracking-wider text-white/50">{ssoAgent?.monitorData?.server || 'VPS'} — {ssoAgent?.monitorData?.os || 'Ubuntu'}</p>
                </div>
              </div>
              
              {ssoAgent ? (
                <div className="space-y-3">
                  {[
                    { label: 'CPU', value: ssoAgent.metrics.cpu },
                    { label: 'Memória', value: ssoAgent.metrics.memory },
                    { label: 'Disco', value: ssoAgent.metrics.disk },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs mb-1 text-white/80">
                        <span>{m.label}</span>
                        <span className="font-mono">{m.value}%</span>
                      </div>
                      <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            m.value > 85 ? 'bg-red-500' : m.value > 65 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${m.value}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 flex gap-6 text-sm text-white/60">
                    <div><span className="block text-xs uppercase tracking-wider text-white/40">Uptime</span>{ssoAgent.metrics.uptime}</div>
                    <div><span className="block text-xs uppercase tracking-wider text-white/40">Ping</span>{ssoAgent.metrics.ping}</div>
                  </div>
                </div>
              ) : (
                <div className="text-white/40 text-sm">Dados indisponíveis.</div>
              )}
            </div>

            {/* Token Usage Formatted */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-1.5 bg-violet-500/20 text-violet-400 rounded-lg text-sm">💎</div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90">Consumo de Tokens</h3>
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Gráfico retrospectivo (12 meses)</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-[150px]">
                <div className="flex-1 flex items-end justify-between gap-1 pb-2 border-b border-white/10">
                  {tokenHistory.length > 0 ? tokenHistory.map((val, i) => (
                    <div key={i} className="group relative w-full flex-1 bg-violet-500/20 hover:bg-violet-500/50 rounded-t-sm transition-colors" style={{ height: `${Math.max(5, (val / maxToken) * 100)}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {MONTHS[i]}: {val}K
                      </div>
                    </div>
                  )) : (
                     <div className="w-full flex items-center justify-center text-white/30 text-sm h-full">Nenhum dado.</div>
                  )}
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/40 font-mono">
                  <span>{MONTHS[0]}</span>
                  <span>{MONTHS[11] || 'Atual'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
                <div className="bg-black/30 p-2 rounded border border-white/5">
                  <div className="text-lg font-mono font-semibold text-white">{(totalTokens * 1000).toLocaleString()}</div>
                  <div className="text-[10px] uppercase text-white/40 tracking-wider">Total</div>
                </div>
                <div className="bg-black/30 p-2 rounded border border-white/5">
                  <div className="text-lg font-mono font-semibold text-white">{tokenHistory.length ? `${tokenHistory[tokenHistory.length - 1]}K` : '—'}</div>
                  <div className="text-[10px] uppercase text-white/40 tracking-wider">Este Mês</div>
                </div>
                <div className="bg-black/30 p-2 rounded border border-white/5">
                  <div className="text-lg font-mono font-semibold text-white">{tokenAgent?.metrics?.tokensTrend || 'Estável'}</div>
                  <div className="text-[10px] uppercase text-white/40 tracking-wider">Tendência</div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {lifeAgent?.monitorData?.recentAlerts?.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Alertas (Agent Life)</h3>
              <div className="space-y-3">
                {lifeAgent.monitorData.recentAlerts.map((alert, i) => (
                  <div key={i} className={`p-4 rounded-lg flex gap-4 items-start ${
                    alert.level === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-200' : 'bg-amber-500/10 border border-amber-500/20 text-amber-200'
                  }`}>
                    <span className="text-xl leading-none">⚠️</span>
                    <div>
                      <div className="font-bold text-sm uppercase tracking-wider mb-1">{alert.level}</div>
                      <div className="text-sm opacity-90">{alert.msg} <span className="opacity-50 ml-2 text-xs">{alert.time}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terminal Logs */}
          <div>
             <h3 className="text-sm font-medium text-white mb-2 mt-4">Logs do Sistema</h3>
             <div className="bg-[#0a0a0A] p-3 rounded-xl border border-white/10 font-mono text-[11px] leading-relaxed h-[200px] overflow-y-auto space-y-1">
               {MOCK_LOGS.map((log, i) => (
                 <div key={i} className="flex gap-3 hover:bg-white/5 px-2 py-0.5 rounded transition-colors group">
                   <span className="text-white/30 shrink-0 select-none group-hover:text-white/50">{log.time}</span>
                   <span className={`shrink-0 w-16 uppercase text-xs font-bold pt-0.5 select-none ${
                     log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-amber-400' : log.level === 'debug' ? 'text-blue-400' : 'text-green-400'
                   }`}>[{log.level}]</span>
                   <span className="text-white/80">{log.msg}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 pb-10">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Live Agent Tracing & Thoughts</h3>
            <p className="text-white/50 text-sm mb-6">Acompanhe o raciocínio da IA e a execução de ferramentas em tempo real.</p>
            <LiveTraceConsole />
          </div>

          <div className="pt-8 border-t border-white/10">
            <h3 className="text-lg font-medium text-white mb-6">Trace History</h3>
            <div className="space-y-4">
              {traces.length === 0 ? (
                <div className="p-12 text-center bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-4xl mb-4">🕵️</div>
                  <p className="text-white/50">Nenhum trace histórico registrado ainda.</p>
                </div>
              ) : traces.map((trace, idx) => (
                <div key={idx} className="bg-[#0a0a0A] border border-white/10 rounded-xl p-6 flex flex-col gap-4 transition-all hover:border-white/20">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                       <span className="bg-violet-500/20 text-violet-400 px-3 py-1 rounded w-fit text-xs font-bold tracking-wider uppercase border border-violet-500/20">
                         {trace.agent_id || 'AGENT'}
                       </span>
                       <span className="text-white/40 text-sm">via {trace.channel}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono text-white/50">
                      <span>⏱ {trace.duration_ms}ms</span>
                      <span>{new Date(trace.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/60 p-4 rounded-lg border border-white/5">
                      <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Prompt</h4>
                      <p className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">{trace.prompt_preview}</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-lg border-l-2 border-l-violet-500 border border-white/5">
                      <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Response</h4>
                      <p className="text-sm text-white/90 whitespace-pre-wrap font-sans leading-relaxed">{trace.response_preview}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-2 flex-wrap">
                       {trace.tools_used && trace.tools_used.length > 0 ? (
                         trace.tools_used.map((tool, i) => (
                           <span key={i} className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20 text-xs font-mono">
                             🔧 {tool}
                           </span>
                         ))
                       ) : (
                         <span className="text-white/30 text-xs italic">Nenhuma ferramenta invocada</span>
                       )}
                    </div>
                    <div className="text-white/40 text-xs font-mono">{trace.model}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
