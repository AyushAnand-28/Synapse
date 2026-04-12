import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import SyllabusUpload from './pages/SyllabusUpload';
import KnowledgeGraph from './pages/KnowledgeGraph';
import StudyPlanner from './pages/StudyPlanner';
import SuccessMetrics from './pages/SuccessMetrics';
import ResearchLibrary from './pages/ResearchLibrary';

const PAGE_TITLES: Record<string, string> = {
  '/':              'Dashboard',
  '/syllabus':      'Syllabus Intelligence',
  '/knowledge-map': 'Knowledge Map',
  '/study-planner': 'Study Planner',
  '/library':       'Research Library',
  '/metrics':       'Success Metrics',
  '/settings':      'Settings',
  '/support':       'Support',
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const base = '/' + pathname.split('/')[1];
  return PAGE_TITLES[base] ?? 'Synapse AI';
}

function TopBar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const title = getTitle(pathname);
  return (
    <header className="topbar">
      <p className="topbar-title">{title}</p>
      <div className="topbar-actions">
        <span style={{ fontSize: 13, color: 'var(--c-on-surface-muted)', marginRight: 8 }}>{user?.email}</span>
        <button className="btn btn-icon" title="Notifications"><span className="mat-icon">notifications</span></button>
        <button className="btn btn-icon" title="Sign out" onClick={logout}><span className="mat-icon">logout</span></button>
        <div className="avatar">{user?.email?.slice(0, 2).toUpperCase() ?? 'U'}</div>
      </div>
    </header>
  );
}

function Placeholder({ name }: { name: string }) {
  return (
    <div className="page-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center', gap: 12 }}>
      <span className="mat-icon" style={{ fontSize: 48, color: 'var(--c-secondary)', opacity: 0.5 }}>construction</span>
      <h2 className="section-heading">{name}</h2>
      <p className="section-sub">This section is coming soon.</p>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12, color: 'var(--c-secondary)' }}>
      <span className="spinner" />
      <span>Loading…</span>
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <Routes>
          <Route path="/"              element={<Dashboard />} />
          <Route path="/syllabus"      element={<SyllabusUpload />} />
          <Route path="/knowledge-map" element={<KnowledgeGraph />} />
          <Route path="/study-planner" element={<StudyPlanner />} />
          <Route path="/metrics"       element={<SuccessMetrics />} />
          <Route path="/library"       element={<ResearchLibrary />} />
          <Route path="/settings"      element={<Placeholder name="Settings" />} />
          <Route path="/support"       element={<Placeholder name="Support" />} />
          <Route path="*"              element={<Placeholder name="Page Not Found" />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
