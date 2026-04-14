import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoadmap, getPerformanceSummary, type RoadmapTask, type RoadmapTopic } from '../api/client';

export default function Dashboard() {
  const { user, activePlanId } = useAuth();
  const [topics,  setTopics]  = useState<RoadmapTopic[]>([]);
  const [tasks,   setTasks]   = useState<RoadmapTask[]>([]);
  const [avgMastery, setAvgMastery] = useState<number | null>(null);

  useEffect(() => {
    if (!activePlanId) return;
    getRoadmap(activePlanId)
      .then(d => { setTopics(d.topics); setTasks(d.tasks); })
      .catch(() => {});
    getPerformanceSummary(activePlanId)
      .then(d => setAvgMastery(d.summary.avg_mastery))
      .catch(() => {});
  }, [activePlanId]);

  const doneCount    = tasks.filter(t => t.status === 'COMPLETED').length;
  const todayTasks   = tasks.slice(0, 5);
  const firstName    = user?.email?.split('@')[0] ?? 'there';

  const QUICK_STATS = [
    { label: 'Topics',       val: String(topics.length || '—'), delta: 'in your plan', icon: 'account_tree',   color: 'var(--c-secondary)'           },
    { label: 'Avg Mastery',  val: avgMastery !== null ? `${avgMastery}%` : '—',        delta: 'across topics', icon: 'military_tech',  color: 'var(--c-tertiary-container)'  },
    { label: 'Tasks',        val: String(tasks.length || '—'),  delta: `${doneCount} done`,               icon: 'event_upcoming', color: 'var(--c-primary-container)'  },
    { label: 'Active Plan',  val: activePlanId ? '✓' : 'None',  delta: activePlanId ? 'syncing' : 'upload syllabus', icon: 'hub', color: '#f97316' },
  ];

  return (
    <div className="page-body fade-up" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Hero greeting */}
      <div style={{
        background: 'linear-gradient(135deg, var(--c-primary-container) 0%, var(--c-secondary) 100%)',
        borderRadius: 'var(--r-xl)', padding: '32px 40px', color: '#fff', marginBottom: 28,
        position: 'relative', overflow: 'hidden',
      }}>
        <div className="glow-orb" style={{ width:300,height:300,background:'#50d9fe',top:-80,right:-60,opacity:0.18 }} />
        <p style={{ fontSize:12,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',opacity:0.75,marginBottom:6 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontFamily:'var(--font-headline)',fontSize:28,fontWeight:700,lineHeight:1.2,marginBottom:8 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName} 👋
        </h1>
        <p style={{ opacity:0.85, fontSize:14, maxWidth:480 }}>
          {activePlanId
            ? `You have ${tasks.length} tasks across ${topics.length} topics. Keep the momentum going.`
            : 'Upload a syllabus to generate your first adaptive study plan.'}
        </p>
        <div style={{ display:'flex', gap:12, marginTop:20 }}>
          <Link to="/study-planner" className="btn" style={{ background:'rgba(255,255,255,0.2)',color:'#fff',backdropFilter:'blur(8px)' }}>
            <span className="mat-icon">event_upcoming</span> View Schedule
          </Link>
          {!activePlanId && (
            <Link to="/syllabus" className="btn" style={{ background:'rgba(255,255,255,0.12)',color:'#fff',backdropFilter:'blur(8px)' }}>
              <span className="mat-icon">upload_file</span> Upload Syllabus
            </Link>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {QUICK_STATS.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
              <p className="stat-label">{s.label}</p>
              <span className="mat-icon" style={{ color:s.color,fontSize:20 }}>{s.icon}</span>
            </div>
            <p className="stat-val" style={{ color:s.color }}>{s.val}</p>
            <p className="stat-sub" style={{ color:'var(--c-tertiary-container)',fontWeight:600 }}>{s.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap:24,alignItems:'start' }}>
        {/* Active tasks */}
        <div className="card card-accent">
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
            <p style={{ fontFamily:'var(--font-headline)',fontWeight:600 }}>Active Tasks</p>
            <Link to="/study-planner" style={{ fontSize:13,color:'var(--c-secondary)',textDecoration:'none',fontWeight:600 }}>
              View all →
            </Link>
          </div>
          {todayTasks.length === 0
            ? <p style={{ textAlign:'center',color:'var(--c-on-surface-muted)',padding:24,fontSize:14 }}>
                {activePlanId ? 'No tasks yet.' : 'Upload a syllabus to build your plan.'}
              </p>
            : todayTasks.map((t, i) => {
                const topic  = topics.find(tp => tp.id === t.topic_id);
                const done   = t.status === 'COMPLETED';
                const active = t.status === 'IN_PROGRESS';
                return (
                  <div key={t.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:'1px solid var(--c-outline-variant)',opacity:done?0.55:1 }}>
                    <span className="mat-icon" style={{ fontSize:18, color: done?'var(--c-tertiary-container)':active?'var(--c-secondary)':'var(--c-outline)' }}>
                      {done?'check_circle':active?'play_circle':'radio_button_unchecked'}
                    </span>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:14,fontWeight:active?700:500,textDecoration:done?'line-through':'none' }}>{topic?.title ?? `Task ${i+1}`}</p>
                      <p style={{ fontSize:11,color:'var(--c-on-surface-muted)' }}>{new Date(t.scheduled_at).toLocaleDateString()} · ~{topic?.estimated_minutes ?? '?'} min</p>
                    </div>
                    {active && <span className="chip chip-teal">Active</span>}
                  </div>
                );
              })
          }
        </div>

        {/* Topic mastery + AI insight */}
        <div className="flex-col gap-md">
          <div className="card">
            <p style={{ fontFamily:'var(--font-headline)',fontWeight:600,marginBottom:14 }}>Topic Progress</p>
            <div className="flex-col gap-sm">
              {topics.slice(0, 5).map(t => (
                <div key={t.id}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                    <span style={{ fontSize:13 }}>{t.title}</span>
                    <span style={{ fontSize:13,fontWeight:700,color:'var(--c-secondary)' }}>{t.mastery_score}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${t.mastery_score}%` }} />
                  </div>
                </div>
              ))}
              {topics.length === 0 && (
                <p style={{ color:'var(--c-on-surface-muted)',fontSize:13,textAlign:'center',padding:16 }}>No topics yet.</p>
              )}
            </div>
          </div>
          <div className="ai-insight">
            <span className="mat-icon">auto_awesome</span>
            <p>
              <strong>Synapse Insight:</strong>{' '}
              {activePlanId
                ? `You have ${topics.length} topics loaded. Log quiz scores in the Study Planner to unlock personalized recommendations.`
                : 'Upload a syllabus to activate AI-powered adaptive scheduling.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

