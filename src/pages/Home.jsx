import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await api.get('/videos', { params });
      setVideos(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [search, category]);

  return (
    <div>
      <h2>Vidéos disponibles</h2>

      <div style={{ display: 'flex', gap: 10, margin: '15px 0' }}>
        <input
          type="text"
          placeholder="Rechercher une vidéo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : videos.length === 0 ? (
        <p>Aucune vidéo trouvée.</p>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <Link
              to={`/video/${video._id}`}
              key={video._id}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card">
                <img src={video.thumbnailUrl} alt={video.title} className="video-thumb" />
                <h3 style={{ marginTop: 10 }}>{video.title}</h3>
                <p style={{ fontSize: 13, color: '#666' }}>
                  {video.teacher?.name} · {video.category?.name}
                </p>
                <p style={{ fontSize: 13 }}>
                  ⭐ {video.averageRating || 0} · 👁 {video.views} vues
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}