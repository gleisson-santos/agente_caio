import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../services/api'
import { 
  Activity, Cpu, Database, Zap, Clock, AlertTriangle, Terminal,
  TrendingUp, Server, HardDrive, Wifi, ArrowUpRight, ChevronRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

/* ── Live Trace ──────────────────────────────────────────────── */
function LiveTrace() {
  const [msgs, setMsgs] = useState([])
  const ref = useRef(null)
  useEffect(() => { const c = api.subscribeToTracingStream(d => setMsgs(p => [...p.slice(-39), d])); return () => c(); }, [])
  useEffect(() => { ref.current && (ref.current.scrollTop = ref.current.scrollHeight); }, [msgs])

  return (
    <div className="rounded-2xl bg-zinc-50/80 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-zinc-400" />
          <span className="text-[13px] font-semibold text-zinc-700">Stream de Pensamento</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-600 font-semibold">LIVE</span>
        </div>
      </div>
      <div className="h-[380px] px-4 pb-4 overflow-y-auto custom-scrollbar space-y-2" ref={ref}>
        {msgs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-300 gap-2">
            <Activity className="w-6 h-6 animate-gentle-pulse" />
            <span className="text-[12px] font-medium">Aguardando atividade...</span>
          </div>
        )}
        {msgs.map((m, i) => (
          <motion.div key={i} initial={{opacity:0,x:-4}} animate={{opacity:1,x:0}} className="flex gap-2.5 group">
            <span className="text-[10px] text-zinc-300 pt-2.5 shrink-0 font-mono w-12 tabular-nums">{new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
            <div className={cn("flex-1 px-3.5 py-2.5 rounded-xl text-[13px]", m.type === 'error' ? "bg-red-50" : "bg-white")}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-semibold text-violet-600">@{m.agent_id}</span>
                <span className="text-[10px] text-zinc-300 font-medium">{m.step || m.type}</span>
              </div>
              <p className="text-zinc-500 text-[12.5px] leading-relaxed">{m.content || '—'}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function MonitorPage() {
  const [agents, setAgents] = useState([])
  const [services, setServices] = useState([])
  const [traces, setTraces] = useState([])
  const [tokenStats, setTokenStats] = useState(null)
  const [tab, setTab] = useState('overview')

  const fetch = useCallback(async () => {
    try { 
      const [a, s, t, tok] = await Promise.all([
        api.getAgents(), 
        api.getServices(), 
        api.getTracingLogs(),
        api.getTokenStats()
      ]); 
      setAgents(a||[]); 
      setServices(s||[]); 
      setTraces(t||[]); 
      if (tok && !tok.status) setTokenStats(tok);
    } catch {}
  }, [])
  useEffect(() => { fetch(); const iv = setInterval(fetch, 10000); return () => clearInterval(iv) }, [fetch])

  const sso = agents.find(a => a.agent === 'agent-sso')
  const life = agents.find(a => a.agent === 'agent-life')
  
  const totalTokensRaw = tokenStats?.tokens_total_today || 0
  const dailyHistory = tokenStats?.daily_history || {}
  const hist = Object.values(dailyHistory).slice(-12).map(v => Math.round(v / 1000))

  const maxT = Math.max(...(hist.length ? hist : [1]))

  const metrics = [
    { label: 'Saúde', value: sso ? '99.9%' : '—', sub: 'Todos os sistemas', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Uptime', value: sso?.uptime || '—', sub: 'Desde último restart', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Tokens H.', value: totalTokensRaw >= 1000 ? `${(totalTokensRaw/1000).toFixed(1)}K` : totalTokensRaw, sub: 'Hoje acumulado', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Alertas', value: life?.metrics?.alerts_active || 0, sub: 'Ativos agora', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50' },
  ]

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Monitoramento</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">Infraestrutura e inteligência dos agentes em tempo real.</p>
        </div>
        <div className="flex rounded-xl bg-zinc-100 p-0.5">
          {[{id:'overview',l:'Infraestrutura'},{id:'tracing',l:'Logs IA'}].map(t2 => (
            <button key={t2.id} onClick={() => setTab(t2.id)} className={cn("px-4 py-1.5 rounded-[10px] text-[13px] font-medium transition-all", tab===t2.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>
              {t2.l}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' ? (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {metrics.map((m,i) => (
              <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                className="group p-4 rounded-2xl bg-zinc-50/60 hover:bg-white hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all cursor-default">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", m.bg)}><m.icon className={cn("w-4.5 h-4.5", m.color)} /></div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-200 group-hover:text-zinc-400 transition-colors" />
                </div>
                <p className="text-[22px] font-semibold text-zinc-900 tracking-tight">{m.value}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{m.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Chart + VPS */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Token Chart */}
            <div className="lg:col-span-3 p-5 rounded-2xl bg-zinc-50/60">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[13px] font-semibold text-zinc-700">Consumo de Tokens (K)</p>
                <span className="text-[11px] text-zinc-300 font-medium">Dias recentes</span>
              </div>
              <div className="h-40 flex items-end gap-1.5">
                {hist.length > 0 ? hist.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group/b cursor-default">
                    <div className="w-full relative flex items-end justify-center" style={{height:'100%'}}>
                      <motion.div initial={{height:0}} animate={{height:`${(v/maxT)*100}%`}}
                        className="bg-violet-500/70 hover:bg-violet-500 rounded-t-md transition-colors w-full min-h-[2px]" />
                      <div className="absolute -top-6 bg-zinc-900 text-white px-1.5 py-0.5 rounded text-[9px] font-medium opacity-0 group-hover/b:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        {v}K
                      </div>
                    </div>
                    <span className="text-[9px] text-zinc-300 font-medium">Dia {i+1}</span>
                  </div>
                )) : (
                  <div className="w-full flex items-center justify-center text-zinc-300 text-[12px] h-full">Sem dados de tokens ativos...</div>
                )}
              </div>
            </div>

            {/* VPS Health */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-zinc-50/60">
              <p className="text-[13px] font-semibold text-zinc-700 mb-5">Saúde VPS</p>
              {sso ? (
                <div className="space-y-4">
                  {[
                    { l:'CPU', v: sso.metrics.cpu },
                    { l:'Memória', v: sso.metrics.memory },
                    { l:'Disco', v: sso.metrics.disk },
                  ].map(r => (
                    <div key={r.l}>
                      <div className="flex justify-between mb-1.5"><span className="text-[12px] text-zinc-400">{r.l}</span><span className="text-[12px] font-semibold text-zinc-700 tabular-nums">{r.v}%</span></div>
                      <div className="h-1.5 bg-zinc-200/50 rounded-full overflow-hidden">
                        <motion.div initial={{width:0}} animate={{width:`${r.v}%`}} transition={{duration:0.8,ease:'easeOut'}}
                          className={cn("h-full rounded-full", r.v > 90 ? "bg-rose-500" : r.v > 70 ? "bg-amber-400" : "bg-violet-500")} />
                      </div>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-zinc-100">
                    <div className="rounded-xl bg-white p-3"><p className="text-[10px] text-zinc-300 mb-0.5">Ping</p><p className="text-[13px] font-semibold text-zinc-700">{sso.metrics.ping}</p></div>
                    <div className="rounded-xl bg-white p-3"><p className="text-[10px] text-zinc-300 mb-0.5">Rede</p><p className="text-[13px] font-semibold text-emerald-500">Ativo</p></div>
                  </div>
                </div>
              ) : <p className="text-zinc-300 text-[12px]">Offline</p>}
            </div>
          </div>

          {/* Services + Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-[13px] font-semibold text-zinc-700 mb-3">Serviços</p>
              <div className="grid grid-cols-2 gap-2">
                {services.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50/60 hover:bg-white hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all">
                    <span className={cn("w-2 h-2 rounded-full shrink-0", s.status==='online' ? "bg-emerald-400":"bg-zinc-200")} />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-medium text-zinc-700 truncate">{s.name}</p>
                      <p className="text-[10px] text-zinc-300 font-mono truncate">{s.response}{s.port ? ` · :${s.port}`:''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-zinc-700 mb-3">Log do Sistema</p>
              <div className="rounded-xl bg-zinc-50/60 p-3 space-y-0.5 font-mono text-[11px] h-[160px] overflow-y-auto custom-scrollbar">
                {[
                  {t:'13:47:42',l:'info',m:'API: Telegram notification sent'},
                  {t:'13:47:40',l:'info',m:'E-mail check: 0 novas mensagens'},
                  {t:'13:46:30',l:'info',m:'[EXPORT] Download: 3 CSVs'},
                  {t:'13:45:20',l:'info',m:'Bot @CaioAgentbot connected'},
                  {t:'13:45:19',l:'info',m:'Uvicorn on port 18790'},
                  {t:'13:45:16',l:'debug',m:'Agent init — model: grok-4.1'},
                ].map((l,i) => (
                  <div key={i} className="flex gap-2 py-1 px-1.5 rounded hover:bg-white/80 transition-colors text-zinc-400">
                    <span className="text-zinc-300 w-14 shrink-0">{l.t}</span>
                    <span className={cn("w-10 shrink-0 font-semibold", l.l==='error'?'text-rose-400':l.l==='debug'?'text-blue-400':'text-emerald-400')}>{l.l}</span>
                    <span className="text-zinc-500 truncate">{l.m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <LiveTrace />
          {traces.length === 0 ? (
            <div className="py-16 text-center"><p className="text-zinc-300 text-[13px]">Nenhum registro de sessão encontrado.</p></div>
          ) : traces.map((t, i) => (
            <div key={i} className="rounded-2xl bg-zinc-50/60 p-5 space-y-4 hover:bg-white hover:shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-violet-100 text-violet-700 text-[10px] font-semibold">{t.agent_id || 'AGENT'}</span>
                  <span className="text-[11px] text-zinc-300 font-mono">{t.timestamp}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <Clock className="w-3 h-3" />{t.duration_ms}ms
                  <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 font-medium">{t.model}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white text-[12.5px] text-zinc-500 italic leading-relaxed">"{t.prompt_preview}"</div>
                <div className="p-3.5 rounded-xl bg-violet-50/50 border-l-2 border-violet-300 text-[12.5px] text-zinc-700 leading-relaxed">{t.response_preview}</div>
              </div>
              <div className="flex gap-1.5">
                {t.tools_used?.map((tool, j) => (<span key={j} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-medium">🔧 {tool}</span>))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
