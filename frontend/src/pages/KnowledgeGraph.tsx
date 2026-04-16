import { useEffect, useState } from 'react';
import { getKnowledgeGraph, type GraphNode } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// ── Layout constants ──────────────────────────────────────────────────────────
const W = 820, H = 520;
const NODE_R = 26;

function buildLayout(nodes: GraphNode[]): Map<string, { x: number; y: number }> {
  // Topological BFS to assign layers
  const idIndex = new Map(nodes.map((n, i) => [n._id, i]));
  const layers  = new Array(nodes.length).fill(0);

  for (let iter = 0; iter < 3; iter++) {
    nodes.forEach(n => {
      n.dependencies.forEach(dep => {
        const di = idIndex.get(dep);
        const ni = idIndex.get(n._id)!;
        if (di !== undefined) layers[ni] = Math.max(layers[ni], layers[di] + 1);
      });
    });
  }

  const maxLayer = Math.max(...layers, 1);
  const byLayer  = new Map<number, string[]>();
  nodes.forEach((n, i) => {
    const l = layers[i];
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(n._id);
  });

  const pos = new Map<string, { x: number; y: number }>();
  byLayer.forEach((ids, layer) => {
    const x = 60 + (layer / maxLayer) * (W - 120);
    ids.forEach((id, j) => {
      const y = (H / (ids.length + 1)) * (j + 1);
      pos.set(id, { x, y });
    });
  });
  return pos;
}

const STATUS_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  completed: { fill: '#0D3B2E', stroke: '#00C896', text: '#00C896' },
  active:    { fill: '#001B26', stroke: '#50d9fe', text: '#50d9fe' },
  locked:    { fill: '#1a1b31', stroke: '#3d3d5c', text: '#6e6e8c' },
};

function nodeStatus(_n: GraphNode): 'completed' | 'active' | 'locked' {
  // Simple heuristic: first node active, rest locked (real status comes from mastery_score)
  return 'locked';
}

export default function KnowledgeGraph() {
  const { activePlanId } = useAuth();
  const [nodes,    setNodes]    = useState<GraphNode[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [pos,      setPos]      = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    if (!activePlanId) return;
    setLoading(true);
    setError(null);
    getKnowledgeGraph(activePlanId)
      .then(({ graphData }) => {
        setNodes(graphData);
        setPos(buildLayout(graphData));
        if (graphData.length > 0) setSelected(graphData[0]);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [activePlanId]);

  if (!activePlanId) return (
    <div className="page-body fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <span className="mat-icon" style={{ fontSize: 56, color: 'var(--c-secondary)', opacity: 0.5 }}>account_tree</span>
      <h2 className="section-heading">No Active Plan</h2>
      <p className="section-sub">Upload a syllabus first to generate your Knowledge Graph.</p>
      <Link to="/syllabus" className="btn btn-primary"><span className="mat-icon">upload_file</span>Upload Syllabus</Link>
    </div>
  );

  if (loading) return (
    <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12, color: 'var(--c-secondary)' }}>
      <span className="spinner" /><span>Building Knowledge Graph…</span>
    </div>
  );

  if (error) return (
    <div className="page-body fade-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="ai-insight" style={{ borderColor: 'rgba(186,26,26,0.3)', background: 'rgba(186,26,26,0.04)' }}>
        <span className="mat-icon" style={{ color: 'var(--c-error)' }}>error</span>
        <p><strong>Failed to load graph:</strong> {error}</p>
      </div>
    </div>
  );

  return (
    <div className="page-body fade-up" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 className="section-heading">Knowledge Graph</h2>
          <p className="section-sub">{nodes.length} concept nodes · dependency-aware layout</p>
        </div>
        <span className="chip chip-teal">{nodes.length} Nodes</span>
      </div>

      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* SVG Graph */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="rgba(80,217,254,0.5)" />
              </marker>
            </defs>

            {/* Edges */}
            {nodes.map(node =>
              node.dependencies.map(depId => {
                const from = pos.get(depId);
                const to   = pos.get(node._id);
                if (!from || !to) return null;
                return (
                  <line key={`${depId}-${node._id}`}
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="rgba(80,217,254,0.25)" strokeWidth={1.5} markerEnd="url(#arrow)"
                  />
                );
              })
            )}

            {/* Nodes */}
            {nodes.map(node => {
              const p  = pos.get(node._id) ?? { x: W / 2, y: H / 2 };
              const st = nodeStatus(node);
              const c  = STATUS_COLORS[st];
              const isSelected = selected?._id === node._id;
              return (
                <g key={node._id} style={{ cursor: 'pointer' }} onClick={() => setSelected(node)}>
                  {isSelected && (
                    <circle cx={p.x} cy={p.y} r={NODE_R + 8} fill="none" stroke={c.stroke} strokeWidth={2} strokeDasharray="4 3" opacity={0.7}>
                      <animateTransform attributeName="transform" type="rotate" from={`0 ${p.x} ${p.y}`} to={`360 ${p.x} ${p.y}`} dur="8s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={p.x} cy={p.y} r={NODE_R} fill={c.fill} stroke={c.stroke} strokeWidth={isSelected ? 2.5 : 1.5}
                    style={{ filter: st === 'active' ? 'drop-shadow(0 0 8px rgba(80,217,254,0.5))' : 'none' }}
                  />
                  <text x={p.x} y={p.y - 2} textAnchor="middle" dominantBaseline="middle"
                    fill={c.text} fontSize={10} fontFamily="Inter" fontWeight={600} style={{ pointerEvents: 'none' }}
                  >
                    {node.title.substring(0, 14)}{node.title.length > 14 ? '…' : ''}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        <div className="flex-col gap-md">
          {selected ? (
            <div className="card card-accent fade-up">
              <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{selected.title}</p>
              <p style={{ fontSize: 13, color: 'var(--c-on-surface-muted)', marginBottom: 12 }}>
                {selected.dependencies.length} prerequisites
              </p>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--c-on-surface-muted)', marginBottom: 8 }}>Dependencies</p>
                {selected.dependencies.length === 0
                  ? <p style={{ fontSize: 13, color: 'var(--c-on-surface-muted)' }}>No prerequisites — foundational topic.</p>
                  : selected.dependencies.map(did => {
                      const dep = nodes.find(n => n._id === did);
                      return dep ? (
                        <div key={did} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span className="mat-icon" style={{ fontSize: 16, color: 'var(--c-secondary)' }}>arrow_back</span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{dep.title}</span>
                        </div>
                      ) : null;
                    })
                }
              </div>
              <div className="divider" />
              <div className="ai-insight" style={{ marginTop: 0 }}>
                <span className="mat-icon">auto_awesome</span>
                <p style={{ fontSize: 12 }}>AI mapped this node based on semantic analysis of your syllabus.</p>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <span className="mat-icon" style={{ fontSize: 36, color: 'var(--c-secondary)', opacity: 0.4 }}>touch_app</span>
              <p style={{ marginTop: 8, color: 'var(--c-on-surface-muted)', fontSize: 14 }}>Click a node to explore</p>
            </div>
          )}

          <div className="card">
            <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, marginBottom: 12 }}>Legend</p>
            {Object.entries(STATUS_COLORS).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: v.stroke }} />
                <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{k}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
