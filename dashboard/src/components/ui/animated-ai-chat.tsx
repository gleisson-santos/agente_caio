"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import {
    CalendarIcon, SearchIcon, TerminalIcon, CodeIcon,
    Plus, LoaderIcon, ArrowUp,
    PenLine, BookOpen, Mail, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from "../../services/api"
import AgentThinking from "./agent-plan"

/* ── Auto-resize ──────────────────────────────────────────────── */
function useAutoResize({ min, max }: { min: number; max?: number }) {
    const ref = useRef<HTMLTextAreaElement>(null);
    const adjust = useCallback((reset?: boolean) => {
        const t = ref.current; if (!t) return;
        if (reset) { t.style.height = `${min}px`; return; }
        t.style.height = `${min}px`;
        t.style.height = `${Math.max(min, Math.min(t.scrollHeight, max ?? 999))}px`;
    }, [min, max]);
    useEffect(() => { ref.current && (ref.current.style.height = `${min}px`); }, [min]);
    return { ref, adjust };
}

/* ── Greeting ─────────────────────────────────────────────────── */
function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
}

/* ── Command palette ──────────────────────────────────────────── */
const commands = [
    { icon: <SearchIcon className="w-4 h-4" />,   label: "Pesquisar na Web", prefix: "/pesquisa", desc: "Busca em tempo real" },
    { icon: <CodeIcon className="w-4 h-4" />,     label: "Escrever Código",  prefix: "/codigo",   desc: "Gera ou analisa código" },
    { icon: <CalendarIcon className="w-4 h-4" />, label: "Agenda",           prefix: "/cron",     desc: "Cria lembretes" },
    { icon: <TerminalIcon className="w-4 h-4" />, label: "Terminal",         prefix: "/shell",    desc: "Executa no servidor" },
];

const quickActions = [
    { icon: <PenLine className="w-3.5 h-3.5" />,     label: "Escrever",    cmd: "Quero escrever " },
    { icon: <BookOpen className="w-3.5 h-3.5" />,     label: "Aprender",    cmd: "Me explique sobre " },
    { icon: <CodeIcon className="w-3.5 h-3.5" />,     label: "Código",      cmd: "/codigo " },
    { icon: <CalendarIcon className="w-3.5 h-3.5" />, label: "Do Calendar", cmd: "O que tem na minha agenda " },
    { icon: <Mail className="w-3.5 h-3.5" />,         label: "Do Gmail",    cmd: "Verifique meus e-mails " },
];

/* ── Props ─────────────────────────────────────────────────────── */
interface ChatProps {
    sessionId: string;
    onChatUpdate?: (sessionId: string, firstMsg: string) => void;
}

/* ── Shared input JSX (not a component — just a render helper) ── */
function renderCommandPalette(
    showCmd: boolean, cmdRef: React.RefObject<HTMLDivElement>,
    activeCmd: number, pickCmd: (i: number) => void
) {
    if (!showCmd) return null;
    return (
        <motion.div ref={cmdRef}
            className="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-2xl shadow-lg border border-zinc-100 overflow-hidden z-50"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.1 }}>
            <div className="px-4 py-2.5 border-b border-zinc-50">
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Comandos</span>
            </div>
            {commands.map((c, i) => (
                <button key={c.prefix} onClick={() => pickCmd(i)}
                    className={cn("w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left",
                        activeCmd === i ? "bg-violet-50 text-violet-700" : "text-zinc-500 hover:bg-zinc-50")}>
                    <span className={cn("p-1.5 rounded-md", activeCmd === i ? "bg-violet-100" : "bg-zinc-100")}>{c.icon}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium">{c.label}</p>
                        <p className="text-[11px] text-zinc-400">{c.desc}</p>
                    </div>
                    <span className="text-[11px] text-zinc-300 font-mono">{c.prefix}</span>
                </button>
            ))}
        </motion.div>
    );
}

/* ── Main Chat ─────────────────────────────────────────────────── */
export function AnimatedAIChat({ sessionId, onChatUpdate }: ChatProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const endRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showCmd, setShowCmd] = useState(false);
    const [activeCmd, setActiveCmd] = useState(-1);
    const cmdRef = useRef<HTMLDivElement>(null);
    const { ref: textRef, adjust } = useAutoResize({ min: 48, max: 200 });

    // Load history
    useEffect(() => {
        (async () => {
            try {
                const h = await api.getChatHistory(sessionId);
                if (h?.length) setMessages(h);
            } catch {}
        })();
    }, [sessionId]);

    // Scroll on new messages
    useEffect(() => {
        if (messages.length) setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, [messages, isTyping]);

    // Command palette logic
    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCmd(true);
            const idx = commands.findIndex(c => c.prefix.startsWith(value));
            setActiveCmd(idx >= 0 ? idx : -1);
        } else if (showCmd) {
            setShowCmd(false);
        }
    }, [value]);

    useEffect(() => {
        const h = (e: MouseEvent) => { if (cmdRef.current && !cmdRef.current.contains(e.target as Node)) setShowCmd(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const pickCmd = useCallback((i: number) => {
        setValue(commands[i].prefix + ' ');
        setShowCmd(false);
        textRef.current?.focus();
    }, []);

    const handleKey = useCallback((e: React.KeyboardEvent) => {
        if (showCmd) {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActiveCmd(p => (p + 1) % commands.length); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveCmd(p => p <= 0 ? commands.length - 1 : p - 1); }
            else if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); if (activeCmd >= 0) pickCmd(activeCmd); }
            else if (e.key === 'Escape') setShowCmd(false);
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) send();
        }
    }, [showCmd, activeCmd, value]);

    const [activeTool, setActiveTool] = useState<string | undefined>(undefined);

    // ... (logic inside pickCmd or send)

    const send = useCallback(async () => {
        if (!value.trim() || isTyping) return;
        const msg = value.trim();
        setValue(""); adjust(true);

        const newMessages = [...messages, { role: 'user', content: msg }];
        setMessages(newMessages);
        setIsTyping(true);
        setActiveTool("sandbox_exec"); // Simulação inicial para demonstração de CoT

        // Notify sidebar
        if (onChatUpdate) {
            const firstUserMsg = newMessages.find(m => m.role === 'user')?.content || msg;
            onChatUpdate(sessionId, firstUserMsg);
        }

        try {
            // Get enabled skills from session metadata in localStorage
            const sessions = JSON.parse(localStorage.getItem('caio_sessions') || '[]');
            const currentSession = sessions.find((s: any) => s.id === sessionId);
            const enabledTools = currentSession?.enabledSkills || [];

            const res = await api.sendChatMessage(msg, sessionId, null, enabledTools);
            if (res?.content) setMessages(prev => [...prev, { role: 'assistant', content: res.content }]);
            else if (res?.status === 'error') setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${res.message || 'Erro.'}` }]);
            else setMessages(prev => [...prev, { role: 'assistant', content: '⚠ Erro de processamento.' }]);
        } catch (e: any) {
            const err = e.name === 'AbortError' ? '⏳ Timeout.' : `⚠ ${e.message?.slice(0, 60) || 'Erro.'}`;
            setMessages(prev => [...prev, { role: 'assistant', content: err }]);
        } finally { 
            setIsTyping(false); 
            setActiveTool(undefined);
        }
    }, [value, isTyping, messages, sessionId, onChatUpdate, adjust]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        adjust();
    }, [adjust]);

    const empty = messages.length === 0;

    /* ── Render ─────────────────────────────────────────────── */
    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className={cn(
                    "max-w-[720px] mx-auto w-full px-5",
                    empty ? "flex flex-col items-center justify-center min-h-full" : "pt-10 pb-44"
                )}>
                    {empty ? (
                        /* ── Welcome ─────────────────────────────────── */
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-center w-full max-w-[560px]">
                            <h1 className="text-[32px] md:text-[40px] font-semibold text-foreground mb-10 text-center tracking-tight">
                                {greeting()}, Gsantos
                            </h1>

                            {/* Inline input — NOT a component */}
                            <div className="w-full mb-6 relative">
                                <AnimatePresence>
                                    {renderCommandPalette(showCmd, cmdRef, activeCmd, pickCmd)}
                                </AnimatePresence>
                                <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow focus-within:shadow-[0_2px_12px_rgba(0,0,0,0.08)] focus-within:border-zinc-300/80">
                                    <textarea
                                        ref={textRef}
                                        value={value}
                                        onChange={handleChange}
                                        onKeyDown={handleKey}
                                        placeholder="Como posso ajudar você hoje?"
                                        className="w-full px-5 pt-3.5 pb-1 bg-transparent text-foreground text-[15px] resize-none focus:outline-none placeholder:text-zinc-400 min-h-[48px] scrollbar-none"
                                    />
                                    <div className="flex items-center justify-between px-3 pb-2.5">
                                        <button className="p-1.5 rounded-lg text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 transition-colors">
                                            <Plus className="w-5 h-5" />
                                        </button>
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-[12px] text-zinc-300 hidden sm:inline select-none">Caio v4.1</span>
                                            <button onClick={send} disabled={!value.trim() || isTyping}
                                                className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                    value.trim() && !isTyping ? "bg-zinc-900 text-white hover:bg-zinc-700" : "bg-zinc-100 text-zinc-300 cursor-not-allowed")}>
                                                {isTyping ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" strokeWidth={2.5} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {quickActions.map((a, i) => (
                                    <button key={i} onClick={() => { setValue(a.cmd); textRef.current?.focus(); }}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-200 text-zinc-500 text-[13px] font-medium hover:bg-zinc-50 hover:text-zinc-700 hover:border-zinc-300 transition-all">
                                        {a.icon}{a.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        /* ── Messages ────────────────────────────────── */
                        <div className="space-y-6 animate-in">
                            {messages.map((m, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                                    className={cn("flex gap-3", m.role === 'user' ? 'justify-end' : '')}>
                                    {m.role !== 'user' && (
                                        <div className="w-7 h-7 rounded-full bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                                            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                                        </div>
                                    )}
                                    <div className={cn("max-w-[85%]",
                                        m.role === 'user'
                                            ? "bg-zinc-100 rounded-2xl rounded-br-md px-4 py-2.5"
                                            : ""
                                    )}>
                                        {m.role === 'user' ? (
                                            <p className="text-[15px] text-foreground leading-relaxed">{m.content}</p>
                                        ) : (
                                            <div className="text-[15px] text-foreground leading-relaxed prose prose-zinc max-w-none prose-p:my-2 prose-li:my-1.5 prose-ul:my-3 prose-ol:my-3 prose-blockquote:border-l-4 prose-blockquote:border-violet-500 prose-blockquote:bg-violet-50/50 prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:rounded-r-xl prose-blockquote:my-4 prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:text-zinc-700 prose-pre:bg-zinc-50 prose-pre:border prose-pre:border-zinc-100 prose-code:text-violet-600 prose-code:font-mono prose-strong:text-foreground prose-headings:text-foreground prose-a:text-violet-600">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                    <div className="w-7 h-7 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
                                        <Sparkles className="w-3.5 h-3.5 text-violet-500 animate-gentle-pulse" />
                                    </div>
                                    <div className="pt-1"><AgentThinking isThinking={true} currentTool={activeTool} /></div>
                                </motion.div>
                            )}
                            <div ref={endRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Floating input (when messages exist) */}
            {!empty && (
                <div className="bg-gradient-to-t from-white via-white/95 to-transparent pt-4 pb-5 px-5">
                    <div className="max-w-[720px] mx-auto relative">
                        <AnimatePresence>
                            {renderCommandPalette(showCmd, cmdRef, activeCmd, pickCmd)}
                        </AnimatePresence>
                        <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow focus-within:shadow-[0_2px_12px_rgba(0,0,0,0.08)] focus-within:border-zinc-300/80">
                            <textarea
                                ref={textRef}
                                value={value}
                                onChange={handleChange}
                                onKeyDown={handleKey}
                                placeholder="Envie uma mensagem..."
                                className="w-full px-5 pt-3.5 pb-1 bg-transparent text-foreground text-[15px] resize-none focus:outline-none placeholder:text-zinc-400 min-h-[48px] scrollbar-none"
                            />
                            <div className="flex items-center justify-between px-3 pb-2.5">
                                <button className="p-1.5 rounded-lg text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 transition-colors">
                                    <Plus className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-2.5">
                                    <span className="text-[12px] text-zinc-300 hidden sm:inline select-none">Caio v4.1</span>
                                    <button onClick={send} disabled={!value.trim() || isTyping}
                                        className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                            value.trim() && !isTyping ? "bg-zinc-900 text-white hover:bg-zinc-700" : "bg-zinc-100 text-zinc-300 cursor-not-allowed")}>
                                        {isTyping ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" strokeWidth={2.5} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
