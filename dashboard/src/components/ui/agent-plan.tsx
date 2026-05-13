"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Search, Code, CheckCircle2, Loader2, ChevronRight, Activity, Globe, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface toolLog {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'error';
  timestamp: string;
}

export default function AgentThinking({ isThinking, currentTool }: { isThinking: boolean, currentTool?: string }) {
  if (!isThinking) return null;

  const toolIcons: Record<string, any> = {
    "sandbox_exec": <ShieldCheck className="w-4 h-4 text-emerald-500" />,
    "web_search": <Globe className="w-4 h-4 text-blue-500" />,
    "read_file": <Code className="w-4 h-4 text-violet-500" />,
    "write_file": <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    "default": <Activity className="w-4 h-4 text-zinc-400" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full max-w-[500px] bg-white border border-zinc-100 rounded-xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="bg-zinc-50 px-4 py-2 flex items-center justify-between border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin" />
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-tighter">Chain of Thought</span>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono">v5.0 Engine</span>
      </div>

      {/* Logic Steps */}
      <div className="p-3 space-y-3">
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
              <ChevronRight className="w-3 h-3 text-violet-600" />
            </div>
            <div className="w-px h-full bg-zinc-100 min-h-[12px] my-1"></div>
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-[13px] text-zinc-600 font-medium">Analisando contexto e planejando ações...</p>
          </div>
        </div>

        {currentTool && (
          <motion.div 
            initial={{ opacity: 0, x: -5 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
                {toolIcons[currentTool] || toolIcons.default}
              </div>
            </div>
            <div className="flex-1 bg-zinc-50/50 rounded-lg p-2.5 border border-zinc-100/50">
               <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{currentTool}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">Ativo</span>
               </div>
               <p className="text-[12px] text-zinc-500 italic">Executando operação em Sandbox segura...</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer Log */}
      <div className="px-4 py-1.5 bg-zinc-50/30 border-t border-zinc-100 flex items-center gap-2">
        <Terminal className="w-3 h-3 text-zinc-400" />
        <span className="text-[10px] text-zinc-400 font-mono truncate">root@caio-v5:~/workspace# tail -f engine.log</span>
      </div>
    </motion.div>
  );
}
