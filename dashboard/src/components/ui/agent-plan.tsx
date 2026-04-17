"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  CircleX,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tools?: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  level: number;
  dependencies: string[];
  subtasks: Subtask[];
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Analise do Contexto do Usuário",
    description: "Análise inicial das intenções baseadas no input principal",
    status: "in-progress",
    priority: "high",
    level: 0,
    dependencies: [],
    subtasks: [
      {
        id: "1.1",
        title: "Ler documentação base",
        description: "Vasculhar referências do projeto para entender necessidades",
        status: "completed",
        priority: "high",
        tools: ["read_file", "list_dir"],
      },
      {
        id: "1.2",
        title: "Buscar na Web por APIs relevantes",
        description: "Acionar motor de busca Google para docs recentes",
        status: "in-progress",
        priority: "medium",
        tools: ["web_search", "web_fetch"],
      }
    ],
  },
  {
    id: "2",
    title: "Arquitetura e Planejamento Híbrido",
    description: "Definir arquitetura interna e modelar ações",
    status: "pending",
    priority: "high",
    level: 0,
    dependencies: ["1"],
    subtasks: [
      {
        id: "2.1",
        title: "Estruturar componentes UI",
        description: "Mapear todos componentes requeridos",
        status: "pending",
        priority: "high",
        tools: ["write_file"],
      },
      {
        id: "2.2",
        title: "Atualizar cronograma de execução",
        description: "Gerar plano de cron para rodadas noturnas se precisar",
        status: "pending",
        priority: "medium",
        tools: ["cron_scheduler", "google_calendar"],
      }
    ],
  }
];

export default function Plan() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [expandedTasks, setExpandedTasks] = useState<string[]>(["1"]);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});
  const prefersReducedMotion = 
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const toggleSubtaskExpansion = (taskId: string, subtaskId: string) => {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const statuses = ["completed", "in-progress", "pending", "need-help", "failed"];
          const currentIndex = Math.floor(Math.random() * statuses.length);
          const newStatus = statuses[currentIndex];

          const updatedSubtasks = task.subtasks.map((subtask) => ({
            ...subtask,
            status: newStatus === "completed" ? "completed" : subtask.status,
          }));

          return { ...task, status: newStatus, subtasks: updatedSubtasks };
        }
        return task;
      }),
    );
  };

  const toggleSubtaskStatus = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((subtask) => {
            if (subtask.id === subtaskId) {
              const newStatus = subtask.status === "completed" ? "pending" : "completed";
              return { ...subtask, status: newStatus };
            }
            return subtask;
          });

          const allSubtasksCompleted = updatedSubtasks.every(s => s.status === "completed");

          return {
            ...task,
            subtasks: updatedSubtasks,
            status: allSubtasksCompleted ? "completed" : task.status,
          };
        }
        return task;
      }),
    );
  };

  const taskVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : -5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: prefersReducedMotion ? "tween" : "spring", stiffness: 500, damping: 30 }
    },
    exit: { opacity: 0, y: prefersReducedMotion ? 0 : -5, transition: { duration: 0.15 } }
  };

  const subtaskListVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" },
    visible: { 
      height: "auto", opacity: 1, overflow: "visible",
      transition: { duration: 0.25, staggerChildren: prefersReducedMotion ? 0 : 0.05, ease: [0.2, 0.65, 0.3, 0.9] }
    },
    exit: { height: 0, opacity: 0, overflow: "hidden", transition: { duration: 0.2, ease: [0.2, 0.65, 0.3, 0.9] } }
  };

  const subtaskVariants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -10 },
    visible: { opacity: 1, x: 0, transition: { type: prefersReducedMotion ? "tween" : "spring", stiffness: 500, damping: 25 } },
    exit: { opacity: 0, x: prefersReducedMotion ? 0 : -10, transition: { duration: 0.15 } }
  };

  const subtaskDetailsVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" },
    visible: { opacity: 1, height: "auto", overflow: "visible", transition: { duration: 0.25, ease: [0.2, 0.65, 0.3, 0.9] } }
  };

  const statusBadgeVariants = {
    initial: { scale: 1 },
    animate: { scale: prefersReducedMotion ? 1 : [1, 1.05, 1], transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] } }
  };

  return (
    <div className="bg-transparent text-white w-full h-full p-2">
      <motion.div 
        className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] } }}
      >
        <LayoutGroup>
          <div className="p-4 overflow-hidden">
            <h3 className="text-sm font-semibold mb-3 text-white/80 border-b border-white/10 pb-2">Plano de Execução CaioCore</h3>
            <ul className="space-y-1 overflow-hidden">
              {tasks.map((task, index) => {
                const isExpanded = expandedTasks.includes(task.id);
                const isCompleted = task.status === "completed";

                return (
                  <motion.li
                    key={task.id}
                    className={` ${index !== 0 ? "mt-1 pt-2" : ""} `}
                    initial="hidden"
                    animate="visible"
                    variants={taskVariants}
                  >
                    <motion.div 
                      className="group flex items-center px-3 py-1.5 rounded-md"
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.05)", transition: { duration: 0.2 } }}
                    >
                      <motion.div
                        className="mr-2 flex-shrink-0 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task.id); }}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={task.status}
                            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {task.status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : task.status === "in-progress" ? (
                              <CircleDotDashed className="h-4 w-4 text-blue-400" />
                            ) : task.status === "need-help" ? (
                              <CircleAlert className="h-4 w-4 text-yellow-400" />
                            ) : task.status === "failed" ? (
                              <CircleX className="h-4 w-4 text-red-500" />
                            ) : (
                              <Circle className="text-white/30 h-4 w-4" />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </motion.div>

                      <motion.div
                        className="flex min-w-0 flex-grow cursor-pointer items-center justify-between"
                        onClick={() => toggleTaskExpansion(task.id)}
                      >
                        <div className="mr-2 flex-1 truncate text-sm">
                          <span className={`${isCompleted ? "text-white/40 line-through" : "text-white/90"}`}>
                            {task.title}
                          </span>
                        </div>

                        <div className="flex flex-shrink-0 items-center space-x-2 text-[10px]">
                          <motion.span
                            className={`rounded px-1.5 py-0.5 ${
                              task.status === "completed" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : task.status === "in-progress" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : task.status === "need-help" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                    : task.status === "failed" ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                      : "bg-white/10 text-white/50 border border-white/5"
                            }`}
                            variants={statusBadgeVariants}
                            initial="initial"
                            animate="animate"
                            key={task.status}
                          >
                            {task.status.toUpperCase()}
                          </motion.span>
                        </div>
                      </motion.div>
                    </motion.div>

                    <AnimatePresence mode="wait">
                      {isExpanded && task.subtasks.length > 0 && (
                        <motion.div className="relative overflow-hidden" variants={subtaskListVariants} initial="hidden" animate="visible" exit="hidden" layout>
                          <div className="absolute top-0 bottom-0 left-[20px] border-l-2 border-dashed border-white/10" />
                          <ul className="mt-1 mr-2 mb-1.5 ml-3 space-y-0.5">
                            {task.subtasks.map((subtask) => {
                              const subtaskKey = `${task.id}-${subtask.id}`;
                              const isSubtaskExpanded = expandedSubtasks[subtaskKey];

                              return (
                                <motion.li key={subtask.id} className="group flex flex-col py-0.5 pl-6" onClick={() => toggleSubtaskExpansion(task.id, subtask.id)} variants={subtaskVariants} initial="hidden" animate="visible" exit="exit" layout>
                                  <motion.div className="flex flex-1 items-center rounded-md p-1" whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }} layout>
                                    <motion.div className="mr-2 flex-shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSubtaskStatus(task.id, subtask.id); }} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }} layout>
                                      <AnimatePresence mode="wait">
                                        <motion.div key={subtask.status} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}>
                                          {subtask.status === "completed" ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                          ) : subtask.status === "in-progress" ? (
                                            <CircleDotDashed className="h-3.5 w-3.5 text-blue-400" />
                                          ) : (
                                            <Circle className="text-white/20 h-3.5 w-3.5" />
                                          )}
                                        </motion.div>
                                      </AnimatePresence>
                                    </motion.div>

                                    <span className={`cursor-pointer text-xs ${subtask.status === "completed" ? "text-white/30 line-through" : "text-white/70"}`}>
                                      {subtask.title}
                                    </span>
                                  </motion.div>

                                  <AnimatePresence mode="wait">
                                    {isSubtaskExpanded && (
                                      <motion.div className="text-white/50 border-white/10 mt-1 ml-1.5 border-l border-dashed pl-5 text-[11px] overflow-hidden" variants={subtaskDetailsVariants} initial="hidden" animate="visible" exit="hidden" layout>
                                        <p className="py-1">{subtask.description}</p>
                                        {subtask.tools && subtask.tools.length > 0 && (
                                          <div className="mt-0.5 mb-1 flex flex-wrap items-center gap-1.5">
                                            <span className="font-medium text-white/40">Tools:</span>
                                            <div className="flex flex-wrap gap-1">
                                              {subtask.tools.map((tool, idx) => (
                                                <motion.span key={idx} className="bg-violet-500/10 text-violet-300 rounded px-1.5 py-0.5 mt-0 font-medium border border-violet-500/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                                                  {tool}
                                                </motion.span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
}
