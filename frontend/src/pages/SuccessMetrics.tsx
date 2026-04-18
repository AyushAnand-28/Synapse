import { useEffect, useState } from 'react';
import { getPerformanceSummary, type PerformanceSummary } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function RadialChart({ items }: { items: { label: string; val: number }[] }) {
  const cx = 90, cy = 90, r = 68, total = items.length;
  return (
    <svg viewBox="0 0 180 180" width="180" height="180" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--c-secondary)" />
          <stop offset="100%" stopColor="var(--c-primary-container)" />
        </linearGradient>
      </defs>
      {items.map((item, i) => {
        const angle  = (i / total) * 2 * Math.PI - Math.PI / 2;
        const barR   = (item.val / 100) * r;
        const x1 = cx + Math.cos(angle) * 18; const y1 = cy + Math.sin(angle) * 18;
        const x2 = cx + Math.cos(angle) * barR; const y2 = cy + Math.sin(angle) * barR;
        const tx = cx + Math.cos(angle) * (r + 14); const ty = cy + Math.sin(angle) * (r + 14);
        return (
          <g key={item.label}>
            <line x1={cx} y1={cy} x2={cx + Math.cos(angle) * r} y2={cy + Math.sin(angle) * r} stroke="rgba(199,197,211,0.12)" strokeWidth={1} />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#grad)" strokeWidth={3} strokeLinecap="round" />
            <text x={tx} y={ty} textAnchor="middle" fill="var(--c-on-surface-muted)" fontSize="7.5" fontFamily="Inter" dominantBaseline="middle">{item.label}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={18} fill="var(--c-primary-container)" />
      <text x={cx} y={cy + 1} textAnchor="middle" fill="white" fontSize="8" fontFamily="Inter" dominantBaseline="middle" fontWeight="700">AVG</text>
    </svg>
  );
}

export default function SuccessMetrics() {
  const { activePlanId } = useAuth();
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!activePlanId) return;
    setLoading(true);
    getPerformanceSummary(activePlanId)
      .then(({ summary: s }) => setSummary(s))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [activePlanId]);

  if (!activePlanId) return (
    <div className="page-body fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <span className="mat-icon" style={{ fontSize: 56, color: 'var(--c-secondary)', opacity: 0.5 }}>insights</span>
      <h2 className="section-heading">No Active Plan</h2>
      <p className="section-sub">Upload a syllabus to start tracking your performance metrics.</p>
      <Link to="/syllabus" className="btn btn-primary"><span className="mat-icon">upload_file</span>Upload Syllabus</Link>
    </div>
  );

  if (loading) return (
    <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12, color: 'var(--c-secondary)' }}>
      <span className="spinner" /><span>Aggregating performance data…</span>
    </div>
  );

  if (error) return (
    <div className="page-body fade-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="ai-insight" style={{ borderColor: 'rgba(186,26,26,0.3)', background: 'rgba(186,26,26,0.04)' }}>
        <span className="mat-icon" style={{ color: 'var(--c-error)' }}>error</span>
        <p><strong>Error:</strong> {error}</p>
      </div>
    </div>
  );

  const STATS = [
    { label: 'Topics',        val: String(summary?.topic_count ?? 0),  icon: 'category',       color: 'var(--c-secondary)' },
    { label: 'Avg Mastery',   val: `${summary?.avg_mastery ?? 0}%`,    icon: 'military_tech',  color: 'var(--c-tertiary-container)' },
    { label: 'Avg Quiz Score',val: `${summary?.avg_quiz_score ?? 0}%`, icon: 'quiz',           color: 'var(--c-primary-container)' },
    { label: 'Avg Retention', val: `${((summary?.avg_retention ?? 0) * 100).toFixed(0)}%`, icon: 'psychology', color: '#f97316' },
  ];

  const radarItems = (summary?.subjects ?? []).slice(0, 6).map(s => ({
    label: s.title.substring(0, 10),
    val:   s.mastery_score,
  }));

  return (
    <div className="page-body fade-up" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h2 className="section-heading">Success Metrics</h2>
        <p className="section-sub">Real-time performance aggregated from your quiz sessions.</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {STATS.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p className="stat-label">{s.label}</p>
              <span className="mat-icon" style={{ color: s.color, fontSize: 20 }}>{s.icon}</span>
            </div>
            <p className="stat-val" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* Subject performance */}
        <div className="card card-accent">
          <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, marginBottom: 16 }}>Subject Performance</p>
          {(summary?.subjects ?? []).length === 0
            ? (
              <div className="ai-insight">
                <span className="mat-icon">info</span>
                <p>No quiz scores logged yet. Go to Study Planner and log quiz scores to see metrics here.</p>
              </div>
            )
            : (
              <div className="flex-col gap-md">
                {summary!.subjects.map(s => (
                  <div key={s.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</p>
                        <p style={{ fontSize: 11, color: 'var(--c-on-surface-muted)' }}>
                          {s.log_count} sessions · {s.estimated_minutes} min estimated
                        </p>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-secondary)' }}>
                        {s.avg_quiz_score !== null ? `${s.avg_quiz_score}%` : '—'}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div style={{ height: '100%', width: `${s.mastery_score}%`, background: 'var(--c-secondary)', borderRadius: 'var(--r-full)', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Radar + tips */}
        <div className="flex-col gap-md">
          {radarItems.length >= 3 && (
            <div className="card card-indigo" style={{ alignItems: 'center' }}>
              <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, marginBottom: 12 }}>Competency Radar</p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <RadialChart items={radarItems} />
              </div>
            </div>
          )}
          <div className="card">
            <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, marginBottom: 12 }}>AI Recommendations</p>
            <div className="flex-col gap-sm">
              {summary && summary.avg_mastery < 50 && (
                <div style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--c-surface-low)', border: '1px solid var(--c-outline-variant)' }}>
                  <span className="mat-icon" style={{ color: 'var(--c-error)' }}>priority_high</span>
                  <p style={{ fontSize: 13 }}>Mastery below 50% — increase daily review time.</p>
                </div>
              )}
              {summary && summary.avg_quiz_score > 80 && (
                <div style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--c-surface-low)', border: '1px solid var(--c-outline-variant)' }}>
                  <span className="mat-icon" style={{ color: 'var(--c-tertiary-container)' }}>thumb_up</span>
                  <p style={{ fontSize: 13 }}>Great quiz scores! Consider advancing to the next topic.</p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--c-surface-low)', border: '1px solid var(--c-outline-variant)' }}>
                <span className="mat-icon" style={{ color: 'var(--c-secondary)' }}>auto_awesome</span>
                <p style={{ fontSize: 13 }}>Log more quiz scores in Study Planner to get personalized AI insights.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
