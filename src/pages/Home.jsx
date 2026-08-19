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
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    setError('');
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
      setError(err.userMessage || err.response?.data?.message || 'Impossible de charger les contenus pour le moment.');
    } finally {
      setLoading(false);
    }
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

  const getProgressForVideo = (videoId) => progress.find((item) => item.video?._id === videoId);
  const visibleCategories = categories.filter((cat, index, list) => index === list.findIndex((item) => item.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === cat.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()));
  const featuredVideo = videos[0];
  const featuredProgress = featuredVideo ? getProgressForVideo(featuredVideo._id) : null;
  const featuredPercent = featuredVideo && featuredProgress ? Math.min(100, Math.round((featuredProgress.watchedSeconds / (featuredVideo.duration || 1)) * 100)) : user?.role === 'teacher' ? 82 : 64;
  const studentCount = featuredVideo ? Math.max(128, Math.round((featuredVideo.views || 0) * 1.8)) : 248;

  return (
    <div className="home-page">
      {/* HERO */}
      <div className="hero hero-with-image">
        <div className="hero-content">
          <span className="hero-badge">{user?.role === 'teacher' ? '✦ ESPACE CRÉATEUR' : '🎓 PLATEFORME D\'APPRENTISSAGE'}</span>
          <h1 className="hero-title">
            {user?.role === 'teacher' ? 'Partagez. Enseignez.' : 'Apprenez. Partagez.'}
            <br />
            <span className="hero-highlight">{user?.role === 'teacher' ? 'Inspirez une communauté.' : 'Progressez ensemble.'}</span>
          </h1>
          <p className="hero-subtitle">
            {user?.role === 'teacher' ? 'Publiez vos connaissances, accompagnez vos étudiants et mesurez l’impact de vos tutoriels.' : 'Des vidéos de qualité, des enseignants passionnés, une communauté qui vous fait grandir.'}
          </p>
          <div className="hero-actions">
            <button
              className="btn"
              onClick={() =>
                document.getElementById('videos-section').scrollIntoView({ behavior: 'smooth' })
              }
            >
              {user?.role === 'teacher' ? '⬆ Publier un tutoriel' : '▶ Explorer les vidéos'}
            </button>
            {user?.role === 'teacher' ? <Link className="btn btn-outline" to="/upload">📊 Voir mon espace</Link> : <button
              className="btn btn-outline"
              onClick={() =>
                document
                  .getElementById('categories-section')
                  .scrollIntoView({ behavior: 'smooth' })
              }
            >
              ⊞ Voir les catégories
            </button>}
          </div>
        </div>
        <div className="hero-illustration hero-composition">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-illustration-circle">▶</div>
          <div className="hero-mini-card hero-float-delay">
            {featuredVideo?.thumbnailUrl ? <img src={featuredVideo.thumbnailUrl} alt="Miniature du tutoriel recommandé" /> : <div className="hero-mini-placeholder">▶</div>}
            <div><span className="hero-new-badge">NOUVEAU COURS</span><strong>{featuredVideo?.title || 'Un nouveau parcours à découvrir'}</strong><small>{featuredVideo?.category?.name || 'Formation'} · {featuredVideo?.duration ? `${Math.ceil(featuredVideo.duration / 60)} min` : 'Cours pratique'}</small></div>
          </div>
          <div className="hero-progress-card hero-float-slow"><div className="hero-card-line"><span>{user?.role === 'teacher' ? 'Impact du cours' : 'Ta progression'}</span><strong>{featuredPercent}%</strong></div><div className="hero-progress-track"><span style={{ width: `${featuredPercent}%` }} /></div><small>{user?.role === 'teacher' ? `${studentCount} étudiants touchés` : 'Continue ton parcours d’apprentissage'}</small></div>
          <div className="hero-rating-card"><span className="hero-rating-star">★</span><div><strong>{featuredVideo?.averageRating || '4.9'}/5</strong><small>Note moyenne</small></div></div>
          <div className="hero-student-count"><span>◉</span><div><strong>{studentCount}+</strong><small>{user?.role === 'teacher' ? 'étudiants accompagnés' : 'étudiants actifs'}</small></div></div>
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
            {visibleCategories.map((cat) => (
              <div
                key={cat._id}
                className={`category-card ${selectedCategory === cat._id ? 'is-selected' : ''}`}
                onClick={() =>
                  setSelectedCategory(cat._id === selectedCategory ? '' : cat._id)
                }
                style={{
                  borderColor: selectedCategory === cat._id ? '#34d399' : undefined,
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
            <div className="video-grid" aria-label="Chargement des vidéos">
              {[1, 2, 3].map((item) => <div className="video-card skeleton-card" key={item} />)}
            </div>
          ) : error ? (
            <div className="card connection-state">
              <strong>Connexion temporairement indisponible</strong>
              <p>{error}</p>
              <button className="btn" type="button" onClick={fetchAll}>Réessayer</button>
            </div>
          ) : videos.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Aucune vidéo trouvée.</p>
          ) : (
            <div className="video-grid">
              {videos.map((video) => (
                <Link to={`/video/${video._id}`} key={video._id} className="video-card-link">
                  <div className="video-card">
                    <div className="video-thumb-wrap">
                      <img src={video.thumbnailUrl} alt={video.title} className="video-thumb" />
                      <span className="video-play-chip">▶</span>
                      <span className="video-level-chip">{video.level || 'Cours'}</span>
                    </div>
                    <div className="video-card-body">
                      <div className="video-card-kicker"><span>{video.category?.name || 'Formation'}</span><span>{video.duration ? `${Math.ceil(video.duration / 60)} min` : 'Vidéo'}</span></div>
                      <h3 className="video-card-title">{video.title}</h3>
                      <p className="video-card-meta">
                        {video.teacher?.name} · {video.category?.name}
                      </p>
                      <p className="video-card-stats">
                        ⭐ {video.averageRating || 0} · 👁 {video.views || 0} vues
                      </p>
                      {user && getProgressForVideo(video._id) && (
                        <div className="video-card-progress" aria-label="Progression du cours">
                          <span>Progression</span>
                          <span>{Math.min(100, Math.round((getProgressForVideo(video._id).watchedSeconds / (video.duration || 1)) * 100))}%</span>
                          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.round((getProgressForVideo(video._id).watchedSeconds / (video.duration || 1)) * 100))}%` }} /></div>
                        </div>
                      )}
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