"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import {
    CalendarIcon,
    SearchIcon,
    TerminalIcon,
    CodeIcon,
    Paperclip,
    SendIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
    Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from "../../services/api"
import AgentThinking from "./agent-plan"

/* ── Auto-resize textarea hook ─────────────────────────────────── */
function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const ta = textareaRef.current;
            if (!ta) return;
            if (reset) { ta.style.height = `${minHeight}px`; return; }
            ta.style.height = `${minHeight}px`;
            ta.style.height = `${Math.max(minHeight, Math.min(ta.scrollHeight, maxHeight ?? Infinity))}px`;
        },
        [minHeight, maxHeight]
    );
    useEffect(() => { if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`; }, [minHeight]);
    return { textareaRef, adjustHeight };
}

/* ── Command palette ───────────────────────────────────────────── */
interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    prefix: string;
}

const commandSuggestions: CommandSuggestion[] = [
    { icon: <SearchIcon className="w-4 h-4" />, label: "Pesquisar (Fetch)", prefix: "/pesquisa" },
    { icon: <CodeIcon className="w-4 h-4" />,  label: "Escrever Código",  prefix: "/codigo" },
    { icon: <CalendarIcon className="w-4 h-4" />, label: "Agendar / Cron", prefix: "/cron" },
    { icon: <TerminalIcon className="w-4 h-4" />, label: "Linha de Comando", prefix: "/shell" },
];

/* ── Main Chat Component ───────────────────────────────────────── */
export function AnimatedAIChat() {
    const [messages, setMessages] = useState<any[]>([]);
    const [sessionId] = useState(() => `dashboard-daily-${new Date().toISOString().split('T')[0]}`);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 48, maxHeight: 160 });

    /* Load history */
    useEffect(() => {
        (async () => {
            try {
                const h = await api.getChatHistory(sessionId);
                if (h?.length) setMessages(h);
            } catch {}
        })();
    }, [sessionId]);

    /* Auto scroll */
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

    /* Command palette logic */
    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);
            const idx = commandSuggestions.findIndex(c => c.prefix.startsWith(value));
            setActiveSuggestion(idx >= 0 ? idx : -1);
        } else {
            setShowCommandPalette(false);
        }
    }, [value]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (commandPaletteRef.current && !commandPaletteRef.current.contains(e.target as Node)) {
                setShowCommandPalette(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectCommand = (i: number) => {
        setValue(commandSuggestions[i].prefix + ' ');
        setShowCommandPalette(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggestion(p => p < commandSuggestions.length - 1 ? p + 1 : 0); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggestion(p => p > 0 ? p - 1 : commandSuggestions.length - 1); }
            else if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); if (activeSuggestion >= 0) selectCommand(activeSuggestion); }
            else if (e.key === 'Escape') { e.preventDefault(); setShowCommandPalette(false); }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) handleSendMessage();
        }
    };

    const handleSendMessage = async () => {
        if (!value.trim() || isTyping) return;
        const msg = value.trim();
        setValue("");
        adjustHeight(true);
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setIsTyping(true);

        try {
            const response = await api.sendChatMessage(msg, sessionId, null);
            if (response?.content) {
                setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
            } else if (response?.status === 'error') {
                setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Erro: ${response.message || 'Resposta inesperada.'}` }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: '⚠ Erro de processamento. Tente novamente.' }]);
            }
        } catch (e: any) {
            const errMsg = (e.name === 'AbortError' || e.message?.includes('timeout'))
                ? '⏳ Tarefa demorando mais que o esperado. Verifique o Dashboard!'
                : `⚠ Erro: API ${e.message?.includes('502') ? '502 — Servidor reiniciando' : e.message?.slice(0, 80) || 'offline'}`;
            setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
        } finally {
            setIsTyping(false);
        }
    };

    /* ── Render ─────────────────────────────────────────────────── */
    return (
        <div className="flex flex-col h-full w-full bg-transparent text-white overflow-hidden">
            {/* ── Messages area ─────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-8">
                <div className="max-w-3xl mx-auto w-full pt-6 pb-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="flex items-center justify-center h-[50vh]">
                            <div className="text-center space-y-3">
                                <h1 className="text-2xl md:text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40">
                                    O que vamos criar hoje?
                                </h1>
                                <p className="text-sm text-white/40">
                                    Use a barra <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-xs">/</kbd> para chamar poderes do Agente Caio
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={cn(
                                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words whitespace-pre-wrap",
                                    msg.role === 'user'
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20 rounded-br-sm'
                                        : 'bg-[#111114] border border-white/[0.06] text-white/90 rounded-bl-sm prose prose-sm prose-invert max-w-none [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_table]:text-xs'
                                )}
                            >
                                {msg.role === 'user' ? msg.content : (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Inline thinking indicator */}
                    {isTyping && (
                        <div className="flex w-full justify-start">
                            <AgentThinking isThinking={true} />
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* ── Input area (pinned bottom) ────────────────────── */}
            <div className="shrink-0 border-t border-white/[0.04] bg-[#08080a]/80 backdrop-blur-xl px-4 md:px-8 py-4">
                <div className="max-w-3xl mx-auto w-full">
                    <div className="relative bg-[#111114] rounded-xl border border-white/[0.06] shadow-xl">
                        {/* Command palette */}
                        <AnimatePresence>
                            {showCommandPalette && (
                                <motion.div
                                    ref={commandPaletteRef}
                                    className="absolute left-0 right-0 bottom-full mb-2 bg-[#111114] rounded-lg border border-white/10 overflow-hidden shadow-2xl z-50"
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 4 }}
                                    transition={{ duration: 0.12 }}
                                >
                                    {commandSuggestions.map((s, i) => (
                                        <div
                                            key={s.prefix}
                                            onClick={() => selectCommand(i)}
                                            className={cn(
                                                "flex items-center gap-2.5 px-3 py-2.5 text-xs cursor-pointer transition-colors",
                                                activeSuggestion === i ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5"
                                            )}
                                        >
                                            <span className="text-white/50">{s.icon}</span>
                                            <span className="font-medium">{s.label}</span>
                                            <span className="text-white/30 ml-auto">{s.prefix}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Textarea */}
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
                            onKeyDown={handleKeyDown}
                            placeholder="Fale com o Mestre dos Magos..."
                            className="w-full px-4 py-3 bg-transparent text-white/90 text-sm resize-none focus:outline-none placeholder:text-white/20 overflow-hidden"
                        />

                        {/* Toolbar */}
                        <div className="flex items-center justify-between px-3 py-2 border-t border-white/[0.04]">
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setShowCommandPalette(p => !p)}
                                    className={cn(
                                        "p-2 rounded-lg text-white/40 hover:text-white/80 transition-colors",
                                        showCommandPalette && "bg-white/10 text-white/80"
                                    )}
                                >
                                    <Command className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={handleSendMessage}
                                disabled={isTyping || !value.trim()}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                                    value.trim()
                                        ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25 hover:bg-violet-500"
                                        : "bg-white/[0.04] text-white/30 cursor-not-allowed"
                                )}
                            >
                                {isTyping
                                    ? <LoaderIcon className="w-4 h-4 animate-spin" />
                                    : <SendIcon className="w-4 h-4" />}
                                <span>Enviar</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick commands bar */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                        {commandSuggestions.map((s, i) => (
                            <button
                                key={s.prefix}
                                onClick={() => selectCommand(i)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg text-xs text-white/50 hover:text-white/80 transition-all border border-white/[0.03] hover:border-white/[0.08]"
                            >
                                {s.icon}
                                <span>{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
