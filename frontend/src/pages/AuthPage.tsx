import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [mode,     setMode]     = useState<'login' | 'register'>('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-root">
      {/* Background orbs */}
      <div className="glow-orb" style={{ width: 500, height: 500, background: 'var(--c-primary-container)', top: -100, left: -150, opacity: 0.35 }} />
      <div className="glow-orb" style={{ width: 400, height: 400, background: 'var(--c-secondary)', bottom: -80, right: -100, opacity: 0.2 }} />

      <div className="auth-card fade-up">
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, var(--c-secondary) 0%, var(--c-primary-container) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>
            Synapse AI
          </h1>
          <p style={{ fontSize: 13, color: 'var(--c-on-surface-muted)' }}>The Quiet Architect of your learning</p>
        </div>

        {/* Mode toggle */}
        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(null); }}>
            Sign In
          </button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(null); }}>
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-col gap-md" style={{ marginTop: 20 }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="auth-email"
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="auth-password"
              className="form-input"
              type="password"
              placeholder={mode === 'register' ? 'Min 8 characters' : '••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={mode === 'register' ? 8 : undefined}
            />
          </div>

          {error && (
            <div className="ai-insight" style={{ borderColor: 'rgba(186,26,26,0.3)', background: 'rgba(186,26,26,0.05)', padding: '10px 14px' }}>
              <span className="mat-icon" style={{ color: 'var(--c-error)', fontSize: 18 }}>error</span>
              <p style={{ fontSize: 13 }}>{error}</p>
            </div>
          )}

          <button
            id="auth-submit"
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '12px 0' }}
          >
            {loading
              ? <><span className="spinner" /> Processing…</>
              : mode === 'login' ? 'Sign In' : 'Create Account'
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--c-on-surface-muted)', marginTop: 20 }}>
          {mode === 'login'
            ? <>Don't have an account? <button className="btn-ghost" style={{ color: 'var(--c-secondary)', fontWeight: 600 }} onClick={() => setMode('register')}>Sign up</button></>
            : <>Already have an account? <button className="btn-ghost" style={{ color: 'var(--c-secondary)', fontWeight: 600 }} onClick={() => setMode('login')}>Sign in</button></>
          }
        </p>
      </div>
    </div>
  );
}
