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
  const pe = raw.providerEnabled ?? {}
  return {
    model: raw.model ?? 'x-ai/grok-4.1-fast', temperature: raw.temperature ?? 0.7, maxTokens: raw.maxTokens ?? 8192,
    autonomousMode: raw.autonomous !== false,
    telegramEnabled: raw.telegramEnabled ?? false,
    telegramToken: raw.telegramToken ?? '', telegramChatId: raw.telegramNotifyChatId ?? raw.telegramAllowList ?? '',
    emailEnabled: raw.emailEnabled ?? false, emailUser: raw.emailUser ?? '',
    emailPass: raw.emailPass ?? '', smtpHost: raw.smtpHost ?? 'smtp.gmail.com', smtpPort: raw.smtpPort ?? 587,
    openrouterKey: pk.openrouter ?? '', geminiKey: pk.gemini ?? '', deepseekKey: pk.deepseek ?? '',
    openaiKey: pk.openai ?? '', groqKey: pk.groq ?? '', anthropicKey: pk.anthropic ?? '',
    omnirouteKey: pk.omniroute ?? '', omnirouteBase: raw.providerBases?.omniroute ?? '',
    omnirouteCombo: raw.omnirouteCombo ?? '',
    openrouterEnabled: pe.openrouter !== false,
    geminiEnabled: pe.gemini !== false,
    deepseekEnabled: pe.deepseek !== false,
    openaiEnabled: pe.openai !== false,
    groqEnabled: pe.groq !== false,
    anthropicEnabled: pe.anthropic !== false,
    omnirouteEnabled: pe.omniroute !== false,
    searchEngineId: raw.braveKey ?? '',
    searchProvider: raw.searchProvider ?? 'brave',
    tavilyKey: raw.tavilyKey ?? '',
    supabaseUrl: raw.supabaseUrl ?? '', supabaseKey: raw.supabaseKey ?? '',
  }
}

function formToRaw(f: any) {
  return {
    model: f.model,
    temperature: parseFloat(f.temperature),
    maxTokens: parseInt(f.maxTokens),
    autonomous: f.autonomousMode,
    telegramEnabled: f.telegramEnabled,
    telegramToken: f.telegramToken, telegramNotifyChatId: f.telegramChatId, telegramAllowList: f.telegramChatId,
    emailEnabled: f.emailEnabled,
    emailUser: f.emailUser, emailPass: f.emailPass, smtpHost: f.smtpHost, smtpPort: parseInt(f.smtpPort),
    braveKey: f.searchEngineId,
    searchProvider: f.searchProvider,
    tavilyKey: f.tavilyKey,
    supabaseUrl: f.supabaseUrl, supabaseKey: f.supabaseKey,
    omnirouteCombo: f.omnirouteCombo,
    providerKeys: {
      openrouter: f.openrouterKey,
      gemini: f.geminiKey,
      deepseek: f.deepseekKey,
      openai: f.openaiKey,
      groq: f.groqKey,
      anthropic: f.anthropicKey,
      omniroute: f.omnirouteKey
    },
    providerBases: {
      omniroute: f.omnirouteBase
    },
    providerEnabled: {
      openrouter: f.openrouterEnabled,
      gemini: f.geminiEnabled,
      deepseek: f.deepseekEnabled,
      openai: f.openaiEnabled,
      groq: f.groqEnabled,
      anthropic: f.anthropicEnabled,
      omniroute: f.omnirouteEnabled
    }
  }
}

export default function CoreSettings() {
  const [form, setForm] = useState<any>(null)
  const [initialForm, setInitialForm] = useState<any>(null)
  const [tab, setTab] = useState('ia')
  const [showKeys, setShowKeys] = useState<Record<string,boolean>>({})
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ok:boolean,text:string}|null>(null)
  const [gcalCreds, setGcalCreds] = useState(''); const [gcalUrl, setGcalUrl] = useState(''); const [gcalResp, setGcalResp] = useState(''); const [gcalLoad, setGcalLoad] = useState(false); const [gcalMsg, setGcalMsg] = useState<{ok:boolean,t:string}|null>(null); const [gcalMethod, setGcalMethod] = useState<'oauth'|'token'>('token'); const [gcalToken, setGcalToken] = useState('');

  useEffect(() => { 
    (async () => { 
      try { 
        const r = await api.getSettings(); 
        const f = rawToForm(r?.status==='error'?{}:r)
        setForm(f) 
        setInitialForm(JSON.parse(JSON.stringify(f)))
      } catch { 
        setForm(rawToForm({})) 
      } 
    })() 
  }, [])

  const set = (k:string, v:any) => setForm((f:any)=>({...f,[k]:v}))
  const toggle = (k:string) => setShowKeys(p=>({...p,[k]:!p[k]}))
  
  const save = async () => {
    if (!form) return; 
    setLoading(true); 
    setMsg(null)
    try { 
      const r = await api.updateSettings(formToRaw(form)); 
      if (r?.status !== 'error') {
        setMsg({ok:true,text:'Configurações salvas com sucesso!'})
        setInitialForm(JSON.parse(JSON.stringify(form)))
      } else {
        setMsg({ok:false,text:r?.message??'Erro ao salvar'})
      }
    }
    catch(e:any) { 
      setMsg({ok:false,text: e.response?.data?.detail || e.message}) 
    } finally { 
      setLoading(false); 
      setTimeout(()=>setMsg(null),4000) 
    }
  }

  if (!form) return <div className="h-80 flex items-center justify-center"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>

  const tabs = [
    { id: 'ia',    label: 'Modelo de IA', icon: Cpu },
    { id: 'comms', label: 'Comunicação',  icon: MessageCircle },
    { id: 'ext',   label: 'Integrações',  icon: Globe },
    { id: 'auth',  label: 'Chaves',       icon: Key },
  ]

  const Input = ({ label, k, type='text', mono=false, placeholder='', hint='' }: any) => (
    <div className="space-y-1.5">
      <label className="block text-[12.5px] font-medium text-zinc-500">{label}</label>
      <input type={type} className={cn("w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-[13.5px] text-zinc-700 border-0 focus:outline-none focus:ring-2 focus:ring-violet-200 placeholder:text-zinc-300 transition-all", mono && "font-mono")}
        value={form[k]??''} placeholder={placeholder} onChange={e=>set(k,e.target.value)} />
      {hint && <p className="text-[11px] text-zinc-300 mt-1">{hint}</p>}
    </div>
  )

  const Secret = ({ label, k, placeholder='' }: any) => {
    const isSaved = initialForm && form[k] === initialForm[k] && !!form[k] && form[k] !== 'XXXXXXXXX'
    const isSet = isSaved && !showKeys[k]
    const enabledKey = k.endsWith('Key') ? k.replace('Key', 'Enabled') : null
    const isEnabled = enabledKey ? form[enabledKey] !== false : true

    return (
      <div className={cn("space-y-1.5 p-4 rounded-[20px] border transition-all", isEnabled ? "bg-white border-zinc-100" : "bg-zinc-50/50 border-zinc-200/60 opacity-60")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {enabledKey && (
              <input type="checkbox" className="rounded-md text-violet-600 focus:ring-violet-200 border-zinc-300 h-4 w-4 c‍ursor-pointer"
                checked={isEnabled} onChange={e=>set(enabledKey, e.target.checked)} />
            )}
            <label className="text-[12.5px] font-semibold text-zinc-500">{label}</label>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isSet && (
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5"/> CONFIGURADO
              </span>
            )}
            {!isSaved && !!form[k] && (
              <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                • NÃO SALVO
              </span>
            )}
          </div>
        </div>
        <div className="relative">
          <input type={showKeys[k]?'text':'password'} disabled={!isEnabled} className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 pr-10 text-[13px] text-zinc-700 border-0 focus:outline-none focus:ring-2 focus:ring-violet-200 placeholder:text-zinc-300 font-mono transition-all disabled:opacity-50"
            value={form[k]??''} placeholder={placeholder||'••••••••'} onChange={e=>set(k,e.target.value)} />
          <button disabled={!isEnabled} onClick={()=>toggle(k)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors disabled:opacity-50">
            {showKeys[k]?<EyeOff className="w-3.5 h-3.5"/>:<Eye className="w-3.5 h-3.5"/>}
          </button>
        </div>
      </div>
    )
  }

  const SaveSection = () => (
    <div className="flex justify-end pt-4 border-t border-zinc-100 mt-8">
      <button onClick={save} disabled={loading}
        className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold transition-all shadow-sm",
          loading ? "bg-zinc-100 text-zinc-300" : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95")}>
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        Salvar Alterações
      </button>
    </div>
  )

  return (
    <div className="space-y-6 pb-20 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Preferências</h1>
          <p className="text-[14px] text-zinc-400 mt-0.5">Configure o comportamento e integrações do Caio.</p>
        </div>
        <button onClick={save} disabled={loading}
          className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-md",
            loading ? "bg-zinc-100 text-zinc-300" : "bg-violet-600 text-white hover:bg-violet-700 active:scale-95")}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Tudo
        </button>
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            className={cn("flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13.5px] font-semibold shadow-sm border",
              msg.ok ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100")}>
            {msg.ok ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}{msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex rounded-xl bg-zinc-100 p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={cn("flex items-center gap-2 px-5 py-2 rounded-lg text-[13.5px] font-bold transition-all",
              tab===t.id ? "bg-white text-violet-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>
            <t.icon className={cn("w-4 h-4", tab===t.id ? "text-violet-500" : "text-zinc-300")} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 md:p-8 shadow-sm">
        <motion.div key={tab} initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} transition={{duration:0.2}} className="space-y-8">
          {tab === 'ia' && (
            <>
              <div className="space-y-6">
                <Input label="Modelo Principal (OpenRouter ID)" k="model" mono hint="Ex: x-ai/grok-4.1-fast, anthropic/claude-3-5-sonnet" />
                <div className="space-y-3">
                  <label className="block text-[12.5px] font-bold text-zinc-700">Temperatura — <span className="text-violet-600 tabular-nums">{form.temperature}</span></label>
                  <div className="relative pt-2">
                    <input type="range" min="0" max="2" step="0.1" className="w-full accent-violet-600 h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer" value={form.temperature} onChange={e=>set('temperature',e.target.value)} />
                    <div className="flex justify-between mt-2"><span className="text-[11px] font-medium text-zinc-400">Determinístico (Chat)</span><span className="text-[11px] font-medium text-zinc-400">Criativo (Escrita)</span></div>
                  </div>
                </div>
                <Input label="Tokens Máximos" k="maxTokens" type="number" hint="Limite de tokens por resposta (Ex: 4096, 8192)" />

                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 mt-4">
                  <div className="pr-4">
                    <p className="text-[13px] font-bold text-zinc-800">Autonomia Neural</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">Permite que o agente execute scripts e comandos de terminal de forma direta, sem a necessidade de confirmação manual simultânea.</p>
                  </div>
                  <button onClick={() => set('autonomousMode', !form.autonomousMode)}
                    className={cn("px-4 py-2 rounded-xl text-[11px] font-bold tracking-tight shrink-0 transition-all shadow-sm",
                      form.autonomousMode ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-zinc-200 text-zinc-500 hover:bg-zinc-300")}>
                    {form.autonomousMode ? 'AUTÔNOMO' : 'RESTRITO'}
                  </button>
                </div>
              </div>
              <SaveSection />
            </>
          )}

          {tab === 'comms' && (
            <>
              <div className="space-y-8">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-bold text-zinc-800 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-blue-500" />Telegram Bot</p>
                    <button onClick={()=>set('telegramEnabled', !form.telegramEnabled)} className={cn("px-3 py-1 rounded-full text-[10px] font-bold transition-all", form.telegramEnabled ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-400")}>
                      {form.telegramEnabled ? 'ATIVADO' : 'DESATIVADO'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Secret label="Token do Bot" k="telegramToken" placeholder="0000000000:AA..." />
                    <Input label="Chat ID (Notificações)" k="telegramChatId" placeholder="ID do usuário ou grupo" />
                  </div>
                </div>

                <div className="h-px bg-zinc-100" />

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-bold text-zinc-800 flex items-center gap-2"><Mail className="w-5 h-5 text-emerald-500" />E-mail & SMTP</p>
                    <button onClick={()=>set('emailEnabled', !form.emailEnabled)} className={cn("px-3 py-1 rounded-full text-[10px] font-bold transition-all", form.emailEnabled ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-400")}>
                      {form.emailEnabled ? 'ATIVADO' : 'DESATIVADO'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input label="Usuário / E-mail" k="emailUser" placeholder="seu-email@gmail.com" />
                    <Secret label="Senha de App (SMTP/IMAP)" k="emailPass" />
                    <Input label="Host SMTP" k="smtpHost" placeholder="smtp.gmail.com" />
                    <Input label="Porta" k="smtpPort" type="number" placeholder="587" />
                  </div>
                </div>
              </div>
              <SaveSection />
            </>
          )}

          {tab === 'ext' && (
            <>
              <div className="space-y-8">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-bold text-zinc-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-rose-500" />Google Calendar</p>
                    <div className="flex bg-zinc-100 rounded-xl p-1">
                      <button onClick={()=>setGcalMethod('token')} className={cn("px-4 py-1.5 text-[11.5px] font-bold rounded-lg transition-all", gcalMethod==='token'?'bg-white text-zinc-900 shadow-sm':'text-zinc-400 hover:text-zinc-600')}>Token Direto</button>
                      <button onClick={()=>setGcalMethod('oauth')} className={cn("px-4 py-1.5 text-[11.5px] font-bold rounded-lg transition-all", gcalMethod==='oauth'?'bg-white text-zinc-900 shadow-sm':'text-zinc-400 hover:text-zinc-600')}>Login OAuth</button>
                    </div>
                  </div>
                  
                  {gcalMsg && <p className={cn("text-[12.5px] font-bold rounded-xl px-4 py-3 shadow-sm border", gcalMsg.ok?"bg-emerald-50 text-emerald-600 border-emerald-100":"bg-rose-50 text-rose-500 border-rose-100")}>{gcalMsg.t}</p>}
                  
                  {gcalMethod === 'token' && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="block text-[12.5px] font-bold text-zinc-500">JSON do <code className="text-violet-500">token.json</code></label>
                        <textarea className="w-full rounded-xl bg-zinc-50 px-4 py-3 text-[12px] text-zinc-600 border-0 focus:outline-none focus:ring-2 focus:ring-violet-200 font-mono h-[120px] resize-none" value={gcalToken} onChange={e=>setGcalToken(e.target.value)} placeholder='{"token": "ya29...", ...}' />
                      </div>
                      <button onClick={async()=>{setGcalLoad(true); setGcalMsg(null); try { const r = await api.setupGoogleTokenDirect(gcalToken); if(r?.status==='success'){ setGcalMsg({ok:true,t:'Google conectado!'}); setGcalToken(''); } else setGcalMsg({ok:false,t:r?.message??'Erro'}); } catch (e:any) { setGcalMsg({ok:false,t:e.message}) } setGcalLoad(false); }}
                        disabled={gcalLoad||!gcalToken} className="w-full py-3 bg-zinc-900 text-white rounded-xl text-[13px] font-bold hover:bg-zinc-800 transition-all disabled:opacity-40">
                        {gcalLoad ? 'Processando...' : 'Salvar Token Direto'}
                      </button>
                    </div>
                  )}

                  {gcalMethod === 'oauth' && (
                    <div className="space-y-5">
                      {!gcalUrl ? (
                        <>
                          <textarea className="w-full rounded-xl bg-zinc-50 px-4 py-3 text-[12px] text-zinc-600 border-0 focus:outline-none focus:ring-2 focus:ring-violet-200 font-mono h-[120px] resize-none" value={gcalCreds} onChange={e=>setGcalCreds(e.target.value)} placeholder='Cole aqui o conteúdo do credentials.json...' />
                          <button onClick={async()=>{setGcalLoad(true);try{const r=await api.setupGoogleCredentials(gcalCreds);if(r?.status==='ok')setGcalUrl(r.auth_url);else setGcalMsg({ok:false,t:r?.message??'Erro'})}catch(e:any){setGcalMsg({ok:false,t:e.message})}setGcalLoad(false)}}
                            disabled={gcalLoad||!gcalCreds} className="w-full py-3 bg-zinc-100 text-zinc-600 rounded-xl text-[13px] font-bold hover:bg-zinc-200 transition-all">
                            {gcalLoad ? 'Gerando...' : 'Gerar Link de Login'}
                          </button>
                        </>
                      ) : (
                        <div className="space-y-4 p-5 bg-zinc-50 rounded-xl border border-zinc-200">
                          <p className="text-[13px] font-bold text-zinc-700">Autorize e cole o link de retorno:</p>
                          <a href={gcalUrl} target="_blank" className="text-violet-600 text-[11px] font-mono break-all hover:underline block p-3 bg-white rounded-lg border border-zinc-200">{gcalUrl}</a>
                          <input className="w-full rounded-xl bg-white px-4 py-3 text-[12px] font-mono border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-200" value={gcalResp} onChange={e=>setGcalResp(e.target.value)} placeholder="http://localhost/?state=..." />
                          <button onClick={async()=>{setGcalLoad(true);try{const r=await api.confirmGoogleOAuth(gcalResp);if(r?.status==='success'){setGcalMsg({ok:true,t:'Sucesso!'});setGcalUrl('')}else setGcalMsg({ok:false,t:r?.message})}catch(e:any){setGcalMsg({ok:false,t:e.message})}setGcalLoad(false)}}
                            className="w-full py-3 bg-violet-600 text-white rounded-xl text-[13px] font-bold hover:bg-violet-700">Finalizar</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="h-px bg-zinc-100" />

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-bold text-zinc-800 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500" />Busca Web & IA</p>
                    <div className="flex bg-zinc-100 rounded-xl p-1">
                      <button onClick={()=>set('searchProvider','brave')} className={cn("px-4 py-1.5 text-[11.5px] font-bold rounded-lg transition-all", form.searchProvider==='brave'?'bg-white text-zinc-900 shadow-sm':'text-zinc-400 hover:text-zinc-600')}>Brave Search</button>
                      <button onClick={()=>set('searchProvider','tavily')} className={cn("px-4 py-1.5 text-[11.5px] font-bold rounded-lg transition-all", form.searchProvider==='tavily'?'bg-white text-zinc-900 shadow-sm':'text-zinc-400 hover:text-zinc-600')}>Tavily AI</button>
                    </div>
                  </div>
                  {form.searchProvider === 'brave' ? (
                    <Secret label="Brave Search API Key" k="searchEngineId" />
                  ) : (
                    <Secret label="Tavily API Key" k="tavilyKey" placeholder="tvly-..." />
                  )}
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <p className="text-[12px] text-blue-700 font-bold mb-1">Qual provedor escolher?</p>
                    <p className="text-[11.5px] text-zinc-600 leading-relaxed">O <strong>Tavily</strong> é otimizado especificamente para agentes de IA (melhor precisão). O <strong>Brave</strong> é ótimo para buscas gerais e links diretos.</p>
                  </div>
                </div>

                <div className="h-px bg-zinc-100" />

                <div className="space-y-5">
                  <p className="text-[14px] font-bold text-zinc-800 flex items-center gap-2"><Globe className="w-5 h-5 text-indigo-500" />Supabase (Banco de Dados)</p>
                  <Input label="URL do Projeto" k="supabaseUrl" mono placeholder="https://abc.supabase.co" />
                  <Secret label="Anon Key / Service Key" k="supabaseKey" />
                </div>
              </div>
              <SaveSection />
            </>
          )}

          {tab === 'auth' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Secret label="OpenRouter (Grok/Claude/Gemini)" k="openrouterKey" placeholder="sk-or-v1-..." />
                <Secret label="Google Gemini API" k="geminiKey" />
                <Secret label="DeepSeek API" k="deepseekKey" />
                <Secret label="OpenAI API" k="openaiKey" />
                <Secret label="Groq Cloud Key" k="groqKey" />
                <Secret label="Anthropic Key" k="anthropicKey" />
                <div className="col-span-full h-px bg-zinc-100 my-2" />
                <Secret label="Omniroute API Key" k="omnirouteKey" placeholder="sk-omni-..." />
                <Input label="Omniroute Base URL" k="omnirouteBase" placeholder="https://api.omniroute.ai/v1" mono />
                <Input label="Omniroute Combo ID" k="omnirouteCombo" placeholder="Ex: combo-default, uuid..." mono hint="Opcional. Identificador do combo de LLMs para redirecionamento automático." />
              </div>
              <SaveSection />
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
