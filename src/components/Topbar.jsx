import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import localHostLogo from '../assets/localhost-academy-logo.jpeg';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <Link className="topbar-brand localhost-topbar-brand" to="/"><img src={localHostLogo} alt="LocalHost Academy" className="topbar-localhost-logo" /><span className="brand-divider"></span><span>✦</span><strong>DEVLEARN</strong><small>NEXT GEN LEARNING</small></Link>
      <nav className="topbar-nav"><Link to="/">Explore</Link>{user?.role === 'student' && <><Link to="/dashboard">My Learning</Link><Link to="/playlists">Playlists</Link></>}{(user?.role === 'teacher' || user?.role === 'admin') && <Link to="/teacher-dashboard">Creator Studio</Link>}<Link to="/forum">Community</Link></nav>
      <input
        type="text"
        placeholder="Rechercher des vidéos, cours, catégories..."
        className="topbar-search"
      />

      <div className="topbar-right">
        {user ? (
          <>
            <div className={`topbar-user topbar-user-${user.role}`}>
              <div className="avatar-circle">{user.name.charAt(0)}</div>
              <div>
                <div className="user-name">{user.name}</div>
                <div className="user-role">
                  <span className="role-pill">{user.role === 'teacher' ? 'Enseignant' : user.role === 'admin' ? 'Admin' : 'Étudiant'}</span>
                  <span className="role-context">{user.role === 'teacher' ? 'Espace créateur' : user.role === 'admin' ? 'Espace gestion' : 'Espace apprentissage'}</span>
                </div>
              </div>
            </div>
            <button className="btn btn-danger" onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        ) : (
          <button className="btn" onClick={() => navigate('/login')}>
            Connexion
          </button>
        )}
      </div>
    </header>
  );
}