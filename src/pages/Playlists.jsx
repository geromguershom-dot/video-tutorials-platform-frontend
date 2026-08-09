import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchPlaylists = async () => {
    const res = await api.get('/playlists');
    setPlaylists(res.data);
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.post('/playlists', { title, description });
      setTitle('');
      setDescription('');
      setShowForm(false);
      fetchPlaylists();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div>
      <div className="page-header-row">
        <h2>📋 Mes Playlists</h2>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Nouvelle playlist'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginTop: 15 }}>
          <form onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="Titre de la playlist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              rows={2}
              placeholder="Description (optionnel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button className="btn" type="submit">
              Créer
            </button>
          </form>
        </div>
      )}

      <div className="playlist-grid">
        {playlists.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>
            Aucune playlist pour l'instant. Crée ta première playlist !
          </p>
        ) : (
          playlists.map((pl) => (
            <div key={pl._id} className="card playlist-card">
              <div className="playlist-icon">📋</div>
              <h3>{pl.title}</h3>
              <p className="playlist-desc">{pl.description}</p>
              <p className="playlist-count">{pl.videos.length} vidéo(s)</p>
              <div className="playlist-videos">
                {pl.videos.map((v) => (
                  <Link to={`/video/${v._id}`} key={v._id} className="tag" style={{ textDecoration: 'none' }}>
                    {v.title}
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}