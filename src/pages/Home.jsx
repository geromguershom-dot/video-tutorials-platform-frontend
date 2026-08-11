import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [videosRes, categoriesRes] = await Promise.all([
        api.get('/videos', { params: selectedCategory ? { category: selectedCategory } : {} }),
        api.get('/categories'),
      ]);
      setVideos(videosRes.data);
      setCategories(categoriesRes.data);

      if (user) {
        const progressRes = await api.get('/progress');
        setProgress(progressRes.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [user, selectedCategory]);

  const trustPoints = [
    { icon: '⭐', title: 'Cours de qualité', desc: 'Créés par des enseignants passionnés' },
    { icon: '⏱', title: 'Apprentissage flexible', desc: 'Apprenez à votre rythme, où que vous soyez' },
    { icon: '👥', title: 'Communauté active', desc: 'Posez vos questions et échangez entre vous' },
    { icon: '📈', title: 'Suivi de progression', desc: 'Visualisez votre avancée à chaque instant' },
  ];

  return (
    <div>
      {/* HERO */}
      <div className="hero hero-with-image">
        <div className="hero-content">
          <span className="hero-badge">🎓 PLATEFORME D'APPRENTISSAGE</span>
          <h1 className="hero-title">
            Apprenez. Partagez.
            <br />
            <span className="hero-highlight">Progressez ensemble.</span>
          </h1>
          <p className="hero-subtitle">
            Des vidéos de qualité, des enseignants passionnés, une communauté qui vous fait
            grandir.
          </p>
          <div className="hero-actions">
            <button
              className="btn"
              onClick={() =>
                document.getElementById('videos-section').scrollIntoView({ behavior: 'smooth' })
              }
            >
              ▶ Explorer les vidéos
            </button>
            <button
              className="btn btn-outline"
              onClick={() =>
                document
                  .getElementById('categories-section')
                  .scrollIntoView({ behavior: 'smooth' })
              }
            >
              ⊞ Voir les catégories
            </button>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="hero-illustration-circle">🎬</div>
        </div>
      </div>

      {/* TRUST POINTS */}
      <div className="trust-row">
        {trustPoints.map((tp) => (
          <div className="trust-item" key={tp.title}>
            <div className="trust-icon">{tp.icon}</div>
            <div>
              <div className="trust-title">{tp.title}</div>
              <div className="trust-desc">{tp.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="home-layout">
        <div className="home-main">
          {/* CATEGORIES */}
          <div className="section-header" id="categories-section">
            <h2>Catégories populaires</h2>
          </div>
          <div className="category-grid">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="category-card"
                onClick={() =>
                  setSelectedCategory(cat._id === selectedCategory ? '' : cat._id)
                }
                style={{
                  borderColor: selectedCategory === cat._id ? '#7c3aed' : undefined,
                }}
              >
                <div className="category-icon">📂</div>
                <div className="category-name">{cat.name}</div>
              </div>
            ))}
            {categories.length === 0 && (
              <p style={{ color: '#94a3b8' }}>Aucune catégorie.</p>
            )}
          </div>

          {/* VIDEOS */}
          <div className="section-header" id="videos-section">
            <h2>Vidéos populaires</h2>
          </div>

          {loading ? (
            <p>Chargement...</p>
          ) : videos.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Aucune vidéo trouvée.</p>
          ) : (
            <div className="video-grid">
              {videos.map((video) => (
                <Link to={`/video/${video._id}`} key={video._id} className="video-card-link">
                  <div className="video-card">
                    <img src={video.thumbnailUrl} alt={video.title} className="video-thumb" />
                    <div className="video-card-body">
                      <h3 className="video-card-title">{video.title}</h3>
                      <p className="video-card-meta">
                        {video.teacher?.name} · {video.category?.name}
                      </p>
                      <p className="video-card-stats">
                        ⭐ {video.averageRating || 0} · 👁 {video.views} vues
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* SIDEBAR DROITE */}
        {user && (
          <div className="home-side">
            <div className="side-card">
              <h3>Ma progression</h3>
              {progress.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13 }}>
                  Regardez des vidéos pour suivre votre progression.
                </p>
              ) : (
                progress.map((p) => {
                  const percent = p.video?.duration
                    ? Math.min(100, Math.round((p.watchedSeconds / p.video.duration) * 100))
                    : 0;
                  return (
                    <div key={p._id} className="progress-item">
                      <div className="progress-item-top">
                        <span>{p.video?.title}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}