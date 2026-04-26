import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import {
  Save, MessageCircle, Mail, Calendar, Key,
  Globe, Cpu, ChevronRight, Eye, EyeOff, Loader2,
  CheckCircle2, XCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

function rawToForm(raw: any) {
  if (!raw || typeof raw !== 'object') return null
  const pk = raw.providerKeys ?? {}
  return {
    model: raw.model ?? 'x-ai/grok-4.1-fast', temperature: raw.temperature ?? 0.7, maxTokens: raw.maxTokens ?? 8192,
    telegramToken: raw.telegramToken ?? '', telegramChatId: raw.telegramNotifyChatId ?? raw.telegramAllowList ?? '',
    emailEnabled: raw.emailEnabled ?? false, emailUser: raw.emailUser ?? raw.emailUsername ?? raw.imapUsername ?? '',
    emailPass: raw.emailPass ?? raw.imapPassword ?? '', smtpHost: raw.smtpHost ?? 'smtp.gmail.com', smtpPort: raw.smtpPort ?? 587,
    openrouterKey: pk.openrouter ?? '', geminiKey: pk.gemini ?? '', deepseekKey: pk.deepseek ?? '', openaiKey: pk.openai ?? '',
    searchEngineId: raw.braveKey ?? '', supabaseUrl: raw.supabaseUrl ?? '', supabaseKey: raw.supabaseKey ?? '',
  }
}
function formToRaw(f: any) {
  return { model: f.model, temperature: parseFloat(f.temperature), maxTokens: parseInt(f.maxTokens),
    telegramToken: f.telegramToken, telegramNotifyChatId: f.telegramChatId, telegramAllowList: f.telegramChatId,
    emailUser: f.emailUser, emailPass: f.emailPass, smtpHost: f.smtpHost, smtpPort: parseInt(f.smtpPort),
    braveKey: f.searchEngineId, supabaseUrl: f.supabaseUrl, supabaseKey: f.supabaseKey,
    providerKeys: { openrouter: f.openrouterKey, gemini: f.geminiKey, deepseek: f.deepseekKey, openai: f.openaiKey }
  }
}

export default function CoreSettings() {
  const [form, setForm] = useState<any>(null)
  const [tab, setTab] = useState('ia')
  const [showKeys, setShowKeys] = useState<Record<string,boolean>>({})
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ok:boolean,text:string}|null>(null)
  const [gcalCreds, setGcalCreds] = useState(''); const [gcalUrl, setGcalUrl] = useState(''); const [gcalResp, setGcalResp] = useState(''); const [gcalLoad, setGcalLoad] = useState(false); const [gcalMsg, setGcalMsg] = useState<{ok:boolean,t:string}|null>(null)

  useEffect(() => { (async () => { try { const r = await api.getSettings(); setForm(rawToForm(r?.status==='error'?{}:r)) } catch { setForm(rawToForm({})) } })() }, [])

  const set = (k:string, v:any) => setForm((f:any)=>({...f,[k]:v}))
  const toggle = (k:string) => setShowKeys(p=>({...p,[k]:!p[k]}))
  const save = async () => {
    if (!form) return; setLoading(true); setMsg(null)
    try { const r = await api.updateSettings(formToRaw(form)); setMsg(r?.status!=='error'?{ok:true,text:'Salvo'}:{ok:false,text:r?.message??'Erro'}) }
    catch(e:any) { setMsg({ok:false,text:e.message}) } finally { setLoading(false); setTimeout(()=>setMsg(null),3000) }
  }

  if (!form) return <div className="h-80 flex items-center justify-center"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>

  const tabs = [
    { id: 'ia',    label: 'Modelo de IA', icon: Cpu },
    { id: 'comms', label: 'Comunicação',  icon: MessageCircle },
    { id: 'ext',   label: 'Integrações',  icon: Globe },
    { id: 'auth',  label: 'Chaves',       icon: Key },
  ]

  const Input = ({ label, k, type='text', mono=false, placeholder='', hint='' }: any) => (
    <div>
      <label className="block text-[12.5px] font-medium text-zinc-500 mb-1.5">{label}</label>
      <input type={type} className={cn("w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-[13.5px] text-zinc-700 border-0 focus:outline-none focus:ring-2 focus:ring-violet-200 placeholder:text-zinc-300 transition-all", mono && "font-mono")}
        value={form[k]??''} placeholder={placeholder} onChange={e=>set(k,e.target.value)} />
      {hint && <p className="text-[11px] text-zinc-300 mt-1">{hint}</p>}
    </div>
  )

  const Secret = ({ label, k, placeholder='' }: any) => (
    <div>
      <label className="block text-[12.5px] font-medium text-zinc-500 mb-1.5">{label}</label>
      <div className="relative">
        <input type={showKeys[k]?'text':'password'} className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 pr-10 text-[13px] text-zinc-700 border-0 focus:outline-none focus:ring-2 focus:ring-violet-200 placeholder:text-zinc-300 font-mono transition-all"
          value={form[k]??''} placeholder={placeholder||'••••••••'} onChange={e=>set(k,e.target.value)} />
        <button onClick={()=>toggle(k)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors">
          {showKeys[k]?<EyeOff className="w-3.5 h-3.5"/>:<Eye className="w-3.5 h-3.5"/>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Configurações</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">Gerencie o comportamento do Agente Caio.</p>
        </div>
        <button onClick={save} disabled={loading}
          className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all",
            loading ? "bg-zinc-100 text-zinc-300" : "bg-zinc-900 text-white hover:bg-zinc-700 shadow-sm")}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Salvar
        </button>
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium",
              msg.ok ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500")}>
            {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}{msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex rounded-xl bg-zinc-100 p-0.5 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={cn("flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-[13px] font-medium transition-all",
              tab===t.id ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div key={tab} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{duration:0.15}} className="space-y-6">
        {tab === 'ia' && (
          <>
            <Input label="Modelo (OpenRouter ID)" k="model" mono hint="Ex: x-ai/grok-4.1-fast, openai/gpt-4o" />
            <div>
              <label className="block text-[12.5px] font-medium text-zinc-500 mb-2.5">Temperatura — <span className="text-violet-600 font-semibold tabular-nums">{form.temperature}</span></label>
              <div className="relative">
                <input type="range" min="0" max="2" step="0.1" className="w-full accent-violet-500 h-1 rounded-full" value={form.temperature} onChange={e=>set('temperature',e.target.value)} />
                <div className="flex justify-between mt-1"><span className="text-[10px] text-zinc-300">Preciso</span><span className="text-[10px] text-zinc-300">Criativo</span></div>
              </div>
            </div>
            <Input label="Tokens Máximos" k="maxTokens" type="number" />
          </>
        )}

        {tab === 'comms' && (
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-[13px] font-semibold text-zinc-700 flex items-center gap-2"><MessageCircle className="w-4 h-4 text-blue-400" />Telegram</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Secret label="Bot Token" k="telegramToken" />
                <Input label="Chat ID" k="telegramChatId" />
              </div>
            </div>
            <div className="h-px bg-zinc-100" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-zinc-700 flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-400" />E-mail (SMTP)</p>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", form.emailEnabled ? "bg-emerald-50 text-emerald-500" : "bg-zinc-100 text-zinc-300")}>
                  {form.emailEnabled ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Endereço" k="emailUser" />
                <Secret label="App Password" k="emailPass" />
                <Input label="SMTP Host" k="smtpHost" />
                <Input label="Porta" k="smtpPort" type="number" />
              </div>
            </div>
          </div>
        )}

        {tab === 'ext' && (
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-[13px] font-semibold text-zinc-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-rose-400" />Google Calendar</p>
              {gcalMsg && <p className={cn("text-[12px] font-medium rounded-xl px-3.5 py-2.5", gcalMsg.ok?"bg-emerald-50 text-emerald-500":"bg-rose-50 text-rose-500")}>{gcalMsg.t}</p>}
              {!gcalUrl ? (
                <div className="space-y-3">
                  <label className="block text-[12.5px] font-medium text-zinc-500">Credentials JSON</label>
                  <textarea className="w-full rounded-xl bg-zinc-50 px-4 py-3 text-[12px] text-zinc-600 border-0 focus:outline-none focus:ring-2 focus:ring-violet-200 font-mono h-20 resize-none" value={gcalCreds} onChange={e=>setGcalCreds(e.target.value)} placeholder='{"installed":{...}}' />
                  <button onClick={async()=>{setGcalLoad(true);setGcalMsg(null);try{const r=await api.setupGoogleCredentials(gcalCreds);if(r?.status==='ok')setGcalUrl(r.auth_url);else setGcalMsg({ok:false,t:r?.message??'Erro'})}catch(e:any){setGcalMsg({ok:false,t:e.message})}setGcalLoad(false)}}
                    disabled={gcalLoad||!gcalCreds} className="w-full py-2.5 bg-zinc-100 text-zinc-600 rounded-xl text-[13px] font-medium hover:bg-zinc-200 transition-colors disabled:opacity-40">
                    {gcalLoad?'Processando...':'Gerar Link'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-zinc-50 rounded-xl">
                  <a href={gcalUrl} target="_blank" className="text-violet-500 text-[12px] font-mono break-all hover:underline block">{gcalUrl}</a>
                  <input className="w-full rounded-xl bg-white px-4 py-2.5 text-[13px] border-0 focus:outline-none focus:ring-2 focus:ring-violet-200" value={gcalResp} onChange={e=>setGcalResp(e.target.value)} placeholder="URL de retorno..." />
                  <button onClick={async()=>{setGcalLoad(true);const r=await api.confirmGoogleOAuth(gcalResp);if(r?.status==='success'){setGcalMsg({ok:true,t:'Conectado!'});setGcalUrl('')}else setGcalMsg({ok:false,t:r?.message??'Erro'});setGcalLoad(false)}}
                    className="w-full py-2.5 bg-zinc-900 text-white rounded-xl text-[13px] font-medium hover:bg-zinc-700 shadow-sm">Confirmar</button>
                </div>
              )}
            </div>
            <div className="h-px bg-zinc-100" />
            <div className="space-y-4">
              <p className="text-[13px] font-semibold text-zinc-700 flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" />Supabase</p>
              <Input label="URL do Projeto" k="supabaseUrl" mono />
              <Secret label="Anon Key" k="supabaseKey" />
            </div>
          </div>
        )}

        {tab === 'auth' && (
          <div className="space-y-5">
            <Secret label="OpenRouter" k="openrouterKey" placeholder="sk-or-v1-..." />
            <Secret label="Gemini" k="geminiKey" placeholder="AIzaSy..." />
            <Secret label="DeepSeek" k="deepseekKey" placeholder="sk-..." />
            <Secret label="OpenAI" k="openaiKey" placeholder="sk-proj-..." />
            <Secret label="Search Engine" k="searchEngineId" />
          </div>
        )}
      </motion.div>
    </div>
  )
}
