"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  CircleDotDashed,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ThinkingStep {
  id: string;
  title: string;
  status: "completed" | "in-progress" | "pending";
  tools?: string[];
}

interface AgentThinkingProps {
  steps?: ThinkingStep[];
  isThinking?: boolean;
}

const defaultSteps: ThinkingStep[] = [
  { id: "1", title: "Analisando contexto da mensagem", status: "completed" },
  { id: "2", title: "Selecionando ferramentas adequadas", status: "completed", tools: ["read_file", "web_search"] },
  { id: "3", title: "Processando resposta", status: "in-progress" },
];

export default function AgentThinking({ steps = defaultSteps, isThinking = false }: AgentThinkingProps) {
  const [expanded, setExpanded] = useState(false);

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const totalCount = steps.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <motion.div
      className="w-full max-w-[85%] mb-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-[#0c0c10]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        {/* Header — clickable to expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              {isThinking ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </motion.div>
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <span className="text-xs font-medium text-white/70">
              {isThinking ? "Raciocinando..." : `Plano concluído`}
            </span>
            <span className="text-[10px] text-white/30">
              {completedCount}/{totalCount} etapas
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Mini progress bar */}
            <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-white/30" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            )}
          </div>
        </button>

        {/* Expanded Steps */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.65, 0.3, 0.9] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 border-t border-white/[0.04]">
                <ul className="mt-2 space-y-1.5">
                  {steps.map((step, idx) => (
                    <motion.li
                      key={step.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-2.5 py-1"
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {step.status === "completed" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : step.status === "in-progress" ? (
                          <CircleDotDashed className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '3s' }} />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-white/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-xs ${
                            step.status === "completed"
                              ? "text-white/40 line-through"
                              : step.status === "in-progress"
                              ? "text-white/80"
                              : "text-white/30"
                          }`}
                        >
                          {step.title}
                        </span>
                        {step.tools && step.tools.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {step.tools.map((tool) => (
                              <span
                                key={tool}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
