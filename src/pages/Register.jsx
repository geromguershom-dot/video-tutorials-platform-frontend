import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur d'inscription");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <span className="logo-icon">▶</span> DevLearn
        </div>
        <h2 className="auth-title">Créer un compte</h2>
        <p className="auth-subtitle">Rejoignez la communauté et commencez à apprendre</p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label className="auth-label">Nom complet</label>
          <input
            type="text"
            placeholder="Votre nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label className="auth-label">Email</label>
          <input
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="auth-label">Mot de passe</label>
          <input
            type="password"
            placeholder="6 caractères minimum"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="auth-label">Je suis...</label>
          <div className="role-picker">
            <div
              className={`role-option ${role === 'student' ? 'selected' : ''}`}
              onClick={() => setRole('student')}
            >
              🎓 Étudiant
            </div>
            <div
              className={`role-option ${role === 'teacher' ? 'selected' : ''}`}
              onClick={() => setRole('teacher')}
            >
              👨‍🏫 Enseignant
            </div>
          </div>
          <button className="btn auth-submit" type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="auth-switch">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}