import { useEffect, useState } from 'react';
import { getRoadmap, recalculateSchedule, logPerformance, type RoadmapTopic, type RoadmapTask } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const STATUS_META: Record<string, { label: string; chip: string; icon: string }> = {
  TODO:        { label: 'Upcoming',    chip: 'chip-indigo', icon: 'schedule'     },
  IN_PROGRESS: { label: 'In Progress', chip: 'chip-teal',   icon: 'play_circle'  },
  COMPLETED:   { label: 'Done',        chip: 'chip-green',  icon: 'check_circle' },
  MISSED:      { label: 'Missed',      chip: 'chip-red',    icon: 'event_busy'   },
};

export default function StudyPlanner() {
  const { activePlanId } = useAuth();
  const [topics,        setTopics]        = useState<RoadmapTopic[]>([]);
  const [tasks,         setTasks]         = useState<RoadmapTask[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [selectedTask,  setSelectedTask]  = useState<RoadmapTask | null>(null);
  const [rescheduling,  setRescheduling]  = useState(false);
  const [logging,       setLogging]       = useState(false);
  const [logMsg,        setLogMsg]        = useState<string | null>(null);

  function loadRoadmap() {
    if (!activePlanId) return;
    setLoading(true);
    setError(null);
    getRoadmap(activePlanId)
      .then(data => {
        setTopics(data.topics);
        setTasks(data.tasks);
        if (data.tasks.length > 0) setSelectedTask(data.tasks[0]);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadRoadmap(); }, [activePlanId]);

  async function handleRecalculate() {
    if (!activePlanId) return;
    setRescheduling(true);
    try {
      await recalculateSchedule(activePlanId);
      loadRoadmap();
    } catch (err: any) { setError(err.message); }
    finally { setRescheduling(false); }
  }

  async function handleLogScore(topicId: string, score: number) {
    setLogging(true);
    setLogMsg(null);
    try {
      await logPerformance({ topic_id: topicId, quiz_score: score, retention_rate: score / 100 });
      setLogMsg(`Quiz score ${score}% logged!`);
    } catch (err: any) { setLogMsg(`Error: ${err.message}`); }
    finally { setLogging(false); setTimeout(() => setLogMsg(null), 3000); }
  }

  const selectedTopic = selectedTask
    ? topics.find(t => t.id === selectedTask.topic_id)
    : null;

  if (!activePlanId) return (
    <div className="page-body fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <span className="mat-icon" style={{ fontSize: 56, color: 'var(--c-secondary)', opacity: 0.5 }}>event_upcoming</span>
      <h2 className="section-heading">No Active Plan</h2>
      <p className="section-sub">Upload a syllabus to generate your adaptive schedule.</p>
      <Link to="/syllabus" className="btn btn-primary"><span className="mat-icon">upload_file</span>Upload Syllabus</Link>
    </div>
  );

  if (loading) return (
    <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12, color: 'var(--c-secondary)' }}>
      <span className="spinner" /><span>Loading study roadmap…</span>
    </div>
  );

  return (
    <div className="page-body fade-up" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {error && (
        <div className="ai-insight" style={{ marginBottom: 20, borderColor: 'rgba(186,26,26,0.3)', background: 'rgba(186,26,26,0.04)' }}>
          <span className="mat-icon" style={{ color: 'var(--c-error)' }}>error</span>
          <p>{error}</p>
        </div>
      )}

      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* Timeline */}
        <div className="flex-col gap-md">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="section-heading">Neural Study Flow</h2>
              <p className="section-sub">{tasks.length} tasks across {topics.length} topics</p>
            </div>
            <button className="btn btn-secondary" onClick={handleRecalculate} disabled={rescheduling}>
              {rescheduling ? <><span className="spinner" /> Rescheduling…</> : <><span className="mat-icon">refresh</span>Recalculate</>}
            </button>
          </div>

          <div className="card" style={{ padding: 'var(--sp-md)' }}>
            {tasks.length === 0
              ? <p style={{ textAlign: 'center', color: 'var(--c-on-surface-muted)', padding: 32 }}>No tasks yet.</p>
              : (
                <div className="timeline-track">
                  {tasks.map(t => {
                    const topic = topics.find(tp => tp.id === t.topic_id);
                    const meta  = STATUS_META[t.status] ?? STATUS_META['TODO'];
                    return (
                      <div key={t.id} className="timeline-item" onClick={() => setSelectedTask(t)} style={{ cursor: 'pointer' }}>
                        <div className="timeline-time">{new Date(t.scheduled_at).toLocaleDateString()}</div>
                        <div className="timeline-bar" />
                        <div className={`timeline-card ${t.status === 'IN_PROGRESS' ? 'active' : ''}`}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <p className="task-title">{topic?.title ?? 'Unknown Topic'}</p>
                              <p className="task-meta">{topic ? `~${topic.estimated_minutes} min` : ''}</p>
                            </div>
                            <span className={`chip ${meta.chip}`}>{meta.label}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>
        </div>

        {/* Side panel */}
        <div className="flex-col gap-md">
          {selectedTopic && selectedTask ? (
            <div className="card card-accent fade-up">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span className="mat-icon" style={{ color: 'var(--c-secondary)', fontSize: 22 }}>
                  {STATUS_META[selectedTask.status]?.icon}
                </span>
                <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: 17 }}>{selectedTopic.title}</p>
              </div>
              <p style={{ fontSize: 13, color: 'var(--c-on-surface-muted)', marginBottom: 12 }}>
                {new Date(selectedTask.scheduled_at).toLocaleString()} · ~{selectedTopic.estimated_minutes} min
              </p>
              <div className="progress-bar" style={{ marginBottom: 6 }}>
                <div className="progress-fill" style={{ width: `${selectedTopic.mastery_score}%` }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--c-on-surface-muted)', marginBottom: 12 }}>
                Mastery: {selectedTopic.mastery_score}%
              </p>

              {/* Log quiz score */}
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Log Quiz Score</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[60, 70, 80, 90, 100].map(s => (
                    <button key={s} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}
                      onClick={() => handleLogScore(selectedTopic.id, s)} disabled={logging}>
                      {s}%
                    </button>
                  ))}
                </div>
                {logMsg && <p style={{ fontSize: 12, color: 'var(--c-tertiary-container)', marginTop: 6 }}>{logMsg}</p>}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }}><span className="mat-icon">play_arrow</span>Start Session</button>
                <button className="btn btn-secondary" onClick={handleRecalculate} disabled={rescheduling}>Reschedule</button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <span className="mat-icon" style={{ fontSize: 36, color: 'var(--c-secondary)', opacity: 0.4 }}>touch_app</span>
              <p style={{ marginTop: 8, color: 'var(--c-on-surface-muted)', fontSize: 14 }}>Click a task to view details</p>
            </div>
          )}

          {/* Topic masteries */}
          <div className="card">
            <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, marginBottom: 14 }}>Topic Mastery</p>
            <div className="flex-col gap-md">
              {topics.map(t => (
                <div key={t.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{t.title}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-secondary)' }}>{t.mastery_score}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${t.mastery_score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
