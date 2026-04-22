import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { generatePlan } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface ParsedFile {
  name: string;
  parsedAgo: string;
  nodes: number;
}

const RECENT: ParsedFile[] = [
  { name: 'Quantum_Mechanics_II.pdf',    parsedAgo: '2h ago', nodes: 42  },
  { name: 'Neuroscience_Intro_2024.pdf', parsedAgo: '5h ago', nodes: 128 },
  { name: 'Adv_Thermodynamics.docx',     parsedAgo: '1d ago', nodes: 89  },
];

const PREVIEW_NODES = [
  { id: 1, label: 'Sorting Algorithms',  status: 'completed' },
  { id: 2, label: 'Graph Traversal',     status: 'completed' },
  { id: 3, label: 'Dynamic Programming', status: 'active'    },
  { id: 4, label: 'Divide & Conquer',    status: 'active'    },
  { id: 5, label: 'Amortized Analysis',  status: 'locked'    },
  { id: 6, label: 'NP-Completeness',     status: 'locked'    },
];

export default function SyllabusUpload() {
  const { setActivePlanId } = useAuth();
  const [dragging,  setDragging]  = useState(false);
  const [parsing,   setParsing]   = useState(false);
  const [parsed,    setParsed]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [fileName,  setFileName]  = useState('');
  const [planId,    setPlanId]    = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readAndSubmit(file);
  }
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readAndSubmit(file);
  }

  async function readAndSubmit(file: File) {
    setFileName(file.name);
    setParsing(true);
    setParsed(false);
    setError(null);
    setPlanId(null);

    try {
      let syllabusText: string;

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        syllabusText = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read PDF file'));
          reader.readAsDataURL(file);
        });
      } else {
        syllabusText = await file.text();
      }

      const result = await generatePlan({
        syllabusText,
        title:       file.name.replace(/\.[^.]+$/, ''),
        targetDate:  new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        hoursPerDay: 4,
      });

      setPlanId(result.planId);
      setParsed(true);
      setActivePlanId(result.planId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to process syllabus');
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className="page-body fade-up" style={{ maxWidth: 1080, margin: '0 auto' }}>
      <div className="flex-col gap-sm" style={{ marginBottom: 28 }}>
        <h2 className="section-heading">Syllabus Intelligence</h2>
        <p className="section-sub">
          Upload academic documentation to architect your knowledge graph. Synapse AI will extract
          core concept nodes and map their semantic dependencies.
        </p>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* ── Left column: upload ── */}
        <div className="flex-col gap-md">
          <div className="card card-accent">
            <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, marginBottom: 12 }}>
              Ingest Syllabus Documents
            </p>
            <p style={{ fontSize: 13, color: 'var(--c-on-surface-muted)', marginBottom: 16 }}>
              Drag and drop your course PDF or search your local directory.<br />
              Supported: <span className="chip chip-gray">.pdf</span>{' '}
              <span className="chip chip-gray">.docx</span>{' '}
              <span className="chip chip-gray">.txt</span>
            </p>

            <div
              className={`drop-zone ${dragging ? 'dragging' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <span className="mat-icon" style={{ fontSize: 48 }}>upload_file</span>
              <p style={{ marginTop: 12, fontWeight: 600, color: 'var(--c-on-surface)' }}>
                Drop your syllabus here
              </p>
              <p style={{ fontSize: 13, color: 'var(--c-on-surface-muted)', marginTop: 4 }}>
                or <span style={{ color: 'var(--c-secondary)', fontWeight: 600 }}>browse files</span>
              </p>
              <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }} onChange={handleChange} />
            </div>

            {parsing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, color: 'var(--c-secondary)' }}>
                <span className="spinner" />
                <span style={{ fontSize: 13 }}>Sending <strong>{fileName}</strong> to Synapse AI…</span>
              </div>
            )}
            {error && (
              <div className="ai-insight" style={{ marginTop: 12, borderColor: 'rgba(186,26,26,0.3)', background: 'rgba(186,26,26,0.04)' }}>
                <span className="mat-icon" style={{ color: 'var(--c-error)' }}>error</span>
                <p><strong>Error:</strong> {error}</p>
              </div>
            )}
            {parsed && planId && (
              <div className="ai-insight" style={{ marginTop: 12 }}>
                <span className="mat-icon">check_circle</span>
                <p>
                  <strong>{fileName}</strong> — plan created successfully!{' '}
                  <span style={{ fontSize: 12, color: 'var(--c-on-surface-muted)' }}>Plan ID: {planId}</span>
                </p>
              </div>
            )}
          </div>

          {/* Recent files */}
          <div className="card">
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--c-on-surface-muted)', marginBottom: 12 }}>
              Recently Parsed
            </p>
            <div className="flex-col gap-sm">
              {RECENT.map(f => (
                <div key={f.name} className="file-item" style={{ cursor: 'pointer' }}>
                  <span className="mat-icon">description</span>
                  <div className="file-item-info">
                    <p className="name">{f.name}</p>
                    <p className="meta">Parsed {f.parsedAgo} · {f.nodes} Nodes</p>
                  </div>
                  <span className="chip chip-teal">{f.nodes}n</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column: node preview ── */}
        <div className="flex-col gap-md">
          <div className="card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600 }}>Neural Node Preview</p>
                <p style={{ fontSize: 13, color: 'var(--c-on-surface-muted)' }}>Advanced Algorithmic Theory</p>
              </div>
              <span className="chip chip-indigo">64 Nodes</span>
            </div>

            <div className="flex-col gap-sm">
              {PREVIEW_NODES.map(n => (
                <div key={n.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 'var(--r-md)',
                  background: n.status === 'active' ? 'rgba(0,180,216,0.06)' : 'var(--c-surface-low)',
                  border: `1px solid ${n.status === 'active' ? 'var(--c-secondary)' : 'var(--c-outline-variant)'}`,
                  opacity: n.status === 'locked' ? 0.5 : 1,
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: n.status === 'completed' ? 'var(--c-tertiary-container)'
                              : n.status === 'active'    ? 'var(--c-secondary)'
                              : 'var(--c-outline)',
                    boxShadow: n.status === 'active' ? 'var(--glow-teal)' : 'none',
                  }} />
                  <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{n.label}</span>
                  <span className={`chip ${n.status === 'completed' ? 'chip-green' : n.status === 'active' ? 'chip-teal' : 'chip-gray'}`}>
                    {n.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="divider" />

            <div className="ai-insight">
              <span className="mat-icon">auto_awesome</span>
              <p>
                <strong>Architect's Suggestion:</strong> I've detected semantic overlap between{' '}
                <strong>'Dynamic Programming'</strong> and your previous{' '}
                <strong>'Statistical Learning'</strong> session. Merge these nodes to create a
                cross-disciplinary bridge?
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-primary" style={{ flex: 1 }}>
                <span className="mat-icon">merge_type</span> Merge Nodes
              </button>
              <button className="btn btn-secondary">Dismiss</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
