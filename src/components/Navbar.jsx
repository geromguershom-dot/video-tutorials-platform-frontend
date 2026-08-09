import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar">
      <div>
        <Link to="/">Accueil</Link>
        {user && <Link to="/playlists">Mes Playlists</Link>}
        {user && <Link to="/forum">Forum Q&A</Link>}
        {user && (user.role === 'teacher' || user.role === 'admin') && (
          <Link to="/upload">Uploader</Link>
        )}
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: 15 }}>
              {user.name} ({user.role})
            </span>
            <button className="btn btn-danger" onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        ) : (
          <Link to="/login">Connexion</Link>
        )}
      </div>
    </div>
  );
}