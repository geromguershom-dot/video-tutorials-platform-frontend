import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

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
      fetchPlaylists();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div>
      <h2>Mes Playlists</h2>

      <div className="card" style={{ marginTop: 15 }}>
        <h3>Créer une playlist</h3>
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

      <div style={{ marginTop: 20 }}>
        {playlists.length === 0 ? (
          <p>Aucune playlist pour l'instant.</p>
        ) : (
          playlists.map((pl) => (
            <div key={pl._id} className="card">
              <h3>{pl.title}</h3>
              <p style={{ color: '#666' }}>{pl.description}</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>
                {pl.videos.length} vidéo(s)
              </p>
              {pl.videos.map((v) => (
                <span key={v._id} className="tag">
                  {v.title}
                </span>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}