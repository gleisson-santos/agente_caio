"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import {
    Plus, LoaderIcon, ArrowUp,
    Sparkles, Paperclip, SendHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from "../../services/api";
import AgentThinking from "./agent-plan";

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AnimatedAIChat({ sessionId, onChatUpdate }: { sessionId: string, onChatUpdate?: (id: string, msg: string) => void }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [value, setValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [activeTool, setActiveTool] = useState<string | undefined>(undefined);
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const load = async () => {
            const history = await api.getChatHistory(sessionId);
            if (history?.messages) setMessages(history.messages);
            else setMessages([]);
        };
        load();
    }, [sessionId]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const adjust = useCallback((reset = false) => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = "inherit";
        if (!reset) {
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, []);

    const send = useCallback(async () => {
        if (!value.trim() || isTyping) return;
        const msg = value.trim();
        setValue(""); adjust(true);

        const newMessages = [...messages, { role: 'user', content: msg }];
        setMessages(newMessages);
        setIsTyping(true);
        setActiveTool("sandbox_exec");

        if (onChatUpdate) {
            const firstUserMsg = newMessages.find(m => m.role === 'user')?.content || msg;
            onChatUpdate(sessionId, firstUserMsg);
        }

        try {
            const sessions = JSON.parse(localStorage.getItem('caio_sessions') || '[]');
            const currentSession = sessions.find((s: any) => s.id === sessionId);
            const enabledTools = currentSession?.enabledSkills || [];

            const res = await api.sendChatMessage(msg, sessionId, null, enabledTools);
            if (res?.content) setMessages(prev => [...prev, { role: 'assistant', content: res.content }]);
        } catch (e: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Conexão neural interrompida." }]);
        } finally { 
            setIsTyping(false); 
            setActiveTool(undefined);
        }
    }, [value, isTyping, messages, sessionId, onChatUpdate, adjust]);

    return (
        <div className="flex flex-col h-full bg-white relative">
            
            {/* ── Chat Messages ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-12 pb-40">
                <div className="max-w-3xl mx-auto space-y-12">
                    {messages.length === 0 && !isTyping && (
                        <div className="h-[50vh] flex flex-col items-center justify-center text-center px-6">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                                <Sparkles className="w-6 h-6 text-white" />
                            </motion.div>
                            <h1 className="text-4xl font-black tracking-tighter text-zinc-900 mb-4">Mestre dos Magos</h1>
                            <p className="text-zinc-400 text-[15px] max-w-xs font-medium leading-relaxed">Sincronização completa. <br/>Aguardando sua próxima diretriz soberana.</p>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col">
                            <div className={cn(
                                "flex items-center gap-2 mb-4",
                                m.role === 'user' ? "justify-end" : "justify-start"
                            )}>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">
                                    {m.role === 'user' ? "Identidade Confirmada" : "Resposta Neural"}
                                </span>
                            </div>
                            <div className={cn(
                                "max-w-[95%] md:max-w-[85%]",
                                m.role === 'user' ? "self-end" : "self-start"
                            )}>
                                <div className={cn(
                                    "prose prose-zinc max-w-none text-[16px] leading-relaxed font-medium",
                                    m.role === 'user' 
                                        ? "bg-zinc-50 text-zinc-900 px-6 py-4 rounded-[32px] rounded-tr-none border border-zinc-100" 
                                        : "text-zinc-800"
                                )}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Processamento Ativo</span>
                            </div>
                            <AgentThinking isThinking={true} currentTool={activeTool} />
                        </div>
                    )}
                    <div ref={endRef} />
                </div>
            </div>

            {/* ── Input Bar ── */}
            <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
                <div className="max-w-3xl mx-auto pointer-events-auto">
                    <div className="bg-white border border-zinc-200 rounded-[32px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] p-2 focus-within:border-zinc-400 focus-within:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] transition-all">
                        <div className="flex items-end gap-1">
                            <button className="p-3.5 hover:bg-zinc-50 rounded-full text-zinc-400 transition-all">
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <textarea
                                ref={textareaRef}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-3.5 px-2 resize-none max-h-40 font-medium placeholder:text-zinc-400 outline-none"
                                placeholder="Dite o futuro..."
                                rows={1}
                                value={value}
                                onChange={(e) => { setValue(e.target.value); adjust(); }}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                            />
                            <button 
                                onClick={send}
                                disabled={!value.trim() || isTyping}
                                className="p-3.5 bg-zinc-900 text-white rounded-full disabled:opacity-20 hover:bg-black transition-all shadow-lg active:scale-95"
                            >
                                <ArrowUp className="w-5 h-5" strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-6">
                       <span className="h-px w-8 bg-zinc-100" />
                       <p className="text-[9px] text-zinc-300 font-black uppercase tracking-[0.3em]">
                           Caio Core v5.2 — Sovereign Intelligence
                       </p>
                       <span className="h-px w-8 bg-zinc-100" />
                    </div>
                </div>
            </div>
        </div>
    );
}
