import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  const links = [
    { to: '/', label: 'Accueil', icon: '🏠' },
    ...(user ? [{ to: '/dashboard', label: 'Mon parcours', icon: '📊' }] : []),
    { to: '/playlists', label: 'Playlists', icon: '📋' },
    { to: '/forum', label: 'Forum Q&A', icon: '💬' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">▶</span> DevLearn
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className={`sidebar-link ${isActive(link.to) ? 'active' : ''}`}
          >
            <span>{link.icon}</span> {link.label}
          </Link>
        ))}
      </nav>

      {user && (user.role === 'teacher' || user.role === 'admin') && (
        <>
          <div className="sidebar-section-title">ENSEIGNANT</div>
          <nav className="sidebar-nav">
            <Link to="/upload" className={`sidebar-link ${isActive('/upload') ? 'active' : ''}`}>
              <span>⬆️</span> Uploader
            </Link>
          </nav>
        </>
      )}
    </aside>
  );
}