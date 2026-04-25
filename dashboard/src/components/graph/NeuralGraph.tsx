import React, { useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const nodeStyle = (type: string): React.CSSProperties => {
  const base: React.CSSProperties = { borderRadius: 10, padding: '10px 16px', fontSize: 12, fontWeight: 500 };
  if (type === 'core') return { ...base, background: 'linear-gradient(135deg, #6d28d9, #4f46e5)', border: '2px solid #a78bfa', color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 0 24px rgba(139,92,246,0.3)' };
  if (type === 'specialist') return { ...base, background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid #6366f1', color: '#e0e7ff' };
  return { ...base, background: 'linear-gradient(135deg, #064e3b, #065f46)', border: '1px solid #34d399', color: '#d1fae5' };
};

const edgeStyle = { stroke: '#6366f1' };
const toolEdgeStyle = { stroke: '#34d399' };

export default function NeuralGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setNodes([
      { id: 'caio', position: { x: 400, y: 280 }, data: { label: '🧠 CAIO Core' }, style: nodeStyle('core') },
      { id: 'code', position: { x: 120, y: 100 }, data: { label: '⚡ Código' }, style: nodeStyle('specialist') },
      { id: 'web', position: { x: 680, y: 100 }, data: { label: '🌐 Web' }, style: nodeStyle('specialist') },
      { id: 'db', position: { x: 120, y: 460 }, data: { label: '🗄️ BD' }, style: nodeStyle('specialist') },
      { id: 'email', position: { x: 680, y: 460 }, data: { label: '📧 E-mail' }, style: nodeStyle('specialist') },
      { id: 'calendar', position: { x: 400, y: 520 }, data: { label: '📅 Calendar' }, style: nodeStyle('tool') },
      { id: 'search', position: { x: 900, y: 100 }, data: { label: '🔍 Search' }, style: nodeStyle('tool') },
      { id: 'supabase', position: { x: -80, y: 460 }, data: { label: '🐘 Supabase' }, style: nodeStyle('tool') },
      { id: 'shell', position: { x: 400, y: 60 }, data: { label: '🖥️ Shell' }, style: nodeStyle('tool') },
    ]);
    setEdges([
      { id: 'e1', source: 'caio', target: 'code', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.Arrow, color: '#6366f1' } },
      { id: 'e2', source: 'caio', target: 'web', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.Arrow, color: '#6366f1' } },
      { id: 'e3', source: 'caio', target: 'db', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.Arrow, color: '#6366f1' } },
      { id: 'e4', source: 'caio', target: 'email', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.Arrow, color: '#6366f1' } },
      { id: 'e5', source: 'caio', target: 'calendar', style: toolEdgeStyle, markerEnd: { type: MarkerType.Arrow, color: '#34d399' } },
      { id: 'e6', source: 'caio', target: 'shell', style: toolEdgeStyle, markerEnd: { type: MarkerType.Arrow, color: '#34d399' } },
      { id: 'e7', source: 'web', target: 'search', style: toolEdgeStyle, markerEnd: { type: MarkerType.Arrow, color: '#34d399' } },
      { id: 'e8', source: 'db', target: 'supabase', style: toolEdgeStyle, markerEnd: { type: MarkerType.Arrow, color: '#34d399' } },
    ]);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 500 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        style={{ background: '#050508' }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <MiniMap nodeColor="#7c3aed" maskColor="rgba(0,0,0,0.8)" />
        <Background gap={20} size={1} color="rgba(255,255,255,0.03)" variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
}
