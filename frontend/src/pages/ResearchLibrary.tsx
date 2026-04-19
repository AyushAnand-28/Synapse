import { useEffect, useState } from 'react';
import { getPlansForUser, type PlanSummary } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ResearchLibrary() {
  const { setActivePlanId, activePlanId } = useAuth();
  const [plans,   setPlans]   = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    getPlansForUser()
      .then(({ plans: p }) => setPlans(p))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12, color: 'var(--c-secondary)' }}>
      <span className="spinner" /><span>Loading library…</span>
    </div>
  );

  return (
    <div className="page-body fade-up" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h2 className="section-heading">Research Library</h2>
          <p className="section-sub">All your generated study plans — click one to activate it.</p>
        </div>
        <Link to="/syllabus" className="btn btn-primary">
          <span className="mat-icon">add</span>New Plan
        </Link>
      </div>

      {error && (
        <div className="ai-insight" style={{ marginBottom: 20, borderColor: 'rgba(186,26,26,0.3)', background: 'rgba(186,26,26,0.04)' }}>
          <span className="mat-icon" style={{ color: 'var(--c-error)' }}>error</span>
          <p>{error}</p>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <span className="mat-icon" style={{ fontSize: 48, color: 'var(--c-secondary)', opacity: 0.4 }}>menu_book</span>
          <p style={{ fontSize: 15, color: 'var(--c-on-surface-muted)' }}>No plans yet. Upload a syllabus to get started.</p>
          <Link to="/syllabus" className="btn btn-primary"><span className="mat-icon">upload_file</span>Upload Syllabus</Link>
        </div>
      ) : (
        <div className="flex-col gap-md">
          {plans.map(plan => {
            const isActive = plan._id === activePlanId;
            return (
              <div key={plan._id} className={`card ${isActive ? 'card-accent' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setActivePlanId(plan._id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span className="mat-icon" style={{ color: isActive ? 'var(--c-secondary)' : 'var(--c-outline)', fontSize: 20 }}>
                        {isActive ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                      <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: 16 }}>{plan.title}</p>
                      {isActive && <span className="chip chip-teal">Active</span>}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--c-on-surface-muted)', marginLeft: 28 }}>
                      Created {new Date(plan.createdAt).toLocaleDateString()} ·
                      Target: {new Date(plan.target_date).toLocaleDateString()} ·
                      {plan.daily_hour_commitment}h/day
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link
                      to="/knowledge-map"
                      className="btn btn-secondary"
                      style={{ fontSize: 12 }}
                      onClick={e => { e.stopPropagation(); setActivePlanId(plan._id); }}
                    >
                      <span className="mat-icon">account_tree</span>Graph
                    </Link>
                    <Link
                      to="/study-planner"
                      className="btn btn-primary"
                      style={{ fontSize: 12 }}
                      onClick={e => { e.stopPropagation(); setActivePlanId(plan._id); }}
                    >
                      <span className="mat-icon">event_upcoming</span>Planner
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
