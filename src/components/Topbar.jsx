import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <input
        type="text"
        placeholder="Rechercher des vidéos, cours, catégories..."
        className="topbar-search"
      />

      <div className="topbar-right">
        {user ? (
          <>
            <div className="topbar-user">
              <div className="avatar-circle">{user.name.charAt(0)}</div>
              <div>
                <div className="user-name">{user.name}</div>
                <div className="user-role">
                  {user.role === 'teacher' ? 'Enseignant' : user.role === 'admin' ? 'Admin' : 'Étudiant'}
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