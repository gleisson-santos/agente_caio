"use client";

import { motion } from "framer-motion";
import { X, Code, FileText, Download, ExternalLink, Maximize2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArtifactProps {
  type: 'code' | 'markdown' | 'image';
  title: string;
  content: string;
  onClose: () => void;
}

export default function ArtifactCanvas({ type, title, content, onClose }: ArtifactProps) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-full w-full md:w-[45%] lg:w-[40%] bg-white border-l border-zinc-200 shadow-2xl z-[100] flex flex-col"
    >
      {/* Header */}
      <div className="h-14 border-b border-zinc-100 flex items-center justify-between px-4 bg-zinc-50/50">
        <div className="flex items-center gap-3">
          {type === 'code' ? <Code className="w-4 h-4 text-violet-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
          <div>
            <h3 className="text-[13px] font-bold text-zinc-700 leading-none">{title}</h3>
            <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">{type} artifact</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#FAFAFA]">
        {type === 'code' ? (
          <pre className="p-4 bg-zinc-900 rounded-xl text-zinc-100 font-mono text-[13px] leading-relaxed overflow-x-auto border border-zinc-800 shadow-inner">
            <code>{content}</code>
          </pre>
        ) : (
          <div className="prose prose-zinc max-w-none prose-p:text-[15px] prose-headings:text-zinc-800 prose-blockquote:border-violet-500 prose-blockquote:bg-violet-50/50 prose-code:text-violet-600 prose-code:bg-violet-50 prose-code:px-1 prose-code:rounded">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="h-10 border-t border-zinc-100 flex items-center px-4 bg-white">
         <span className="text-[10px] text-zinc-400 italic">Este artefato é persistente e pode ser editado via comandos CLI.</span>
      </div>
    </motion.div>
  );
}
