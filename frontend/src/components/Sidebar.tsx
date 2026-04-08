import { NavLink } from 'react-router-dom';

const NAV = [
  { icon: 'dashboard',       label: 'Dashboard',          to: '/' },
  { icon: 'upload_file',     label: 'Syllabus Upload',    to: '/syllabus' },
  { icon: 'account_tree',    label: 'Knowledge Map',      to: '/knowledge-map' },
  { icon: 'event_upcoming',  label: 'Study Planner',      to: '/study-planner' },
  { icon: 'menu_book',       label: 'Research Library',   to: '/library' },
  { icon: 'insights',        label: 'Success Metrics',    to: '/metrics' },
];
const FOOTER_NAV = [
  { icon: 'settings',      label: 'Settings',  to: '/settings' },
  { icon: 'help_outline',  label: 'Support',   to: '/support' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>Synapse AI</h1>
        <p>The Quiet Architect</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="mat-icon">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {FOOTER_NAV.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="mat-icon">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
