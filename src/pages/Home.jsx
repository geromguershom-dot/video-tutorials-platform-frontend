import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import studentFocused from '../assets/student-pose-focused.webp';
import studentLaughing from '../assets/student-pose-laughing.webp';
import studentConfident from '../assets/student-pose-confident.webp';
import teacherFront from '../assets/teacher-pose-front.webp';
import teacherThreeQuarter from '../assets/teacher-pose-three-quarter.webp';

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
  const getVideoLevel = (video) => video.level || (video.duration > 720 ? 'Intermédiaire' : video.duration > 540 ? 'Avancé' : 'Débutant');

  return (
    <div className="home-page">
      {/* HERO */}
        <div className="hero hero-with-image hero-clean-layout">
          <div className="hero-student-backdrop" aria-hidden="true"><img src={studentLaughing} alt="" /></div>
          <div className="hero-copy-column">
            <div className="hero-content hero-title-stage">
              <span className="hero-badge">{user?.role === 'teacher' ? '✦ ESPACE CRÉATEUR' : '🎓 PLATEFORME D\'APPRENTISSAGE'}</span>
              <h1 className="hero-title">{user?.role === 'teacher' ? 'Partagez. Enseignez.' : 'Apprenez. Partagez.'}<br /><span className="hero-highlight">{user?.role === 'teacher' ? 'Inspirez une communauté.' : 'Progressez ensemble.'}</span></h1>
              <p className="hero-subtitle">{user?.role === 'teacher' ? 'Publiez, suivez l’impact et répondez aux besoins des élèves.' : 'Des tutoriels clairs, des quiz utiles et une progression visible.'}</p>
              <div className="hero-actions">
                <button className="btn" onClick={() => document.getElementById('videos-section').scrollIntoView({ behavior: 'smooth' })}>{user?.role === 'teacher' ? '⬆ Publier un tutoriel' : '▶ Explorer les vidéos'}</button>
                {user?.role === 'teacher' ? <Link className="btn btn-outline" to="/upload">📊 Voir mon espace</Link> : <button className="btn btn-outline" onClick={() => document.getElementById('categories-section').scrollIntoView({ behavior: 'smooth' })}>⊞ Voir les catégories</button>}
              </div>
            </div>
          </div>
          <div className="hero-visual-column">
            <div className="hero-illustration hero-composition hero-showcase">
              <div className="hero-panel-grid">
                <div className="hero-image-panel panel-tall"><img src={studentFocused} alt="Étudiante concentrée" /><span>01 · FOCUS</span></div>
                <div className="hero-image-panel panel-main"><img src={studentLaughing} alt="Étudiante en apprentissage" /><div className="hero-panel-play">▶</div><span>▶ LEARNING PREVIEW</span></div>
                <div className="hero-image-panel panel-small"><img src={studentConfident} alt="Étudiante confiante" /><span>02 · COMMUNITY</span></div>
              </div>
            </div>
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

      <section className={`learning-story-section ${user?.role === 'teacher' ? 'teacher-story-section' : ''}`}>
        {user?.role === 'teacher' ? (
          <>
            <div className="section-heading-centered"><span className="hero-badge">STUDIO ENSEIGNANT</span><h2>Partage, suis et accompagne tes élèves.</h2><p>DevLearn aide les enseignants à transformer leur expertise en parcours utiles et mesurables.</p></div>
            <div className="learning-steps"><div className="learning-step"><span>01</span><strong>Publie ton expertise</strong><p>Crée des tutoriels clairs et rends tes connaissances accessibles à toute l’école.</p></div><div className="learning-step"><span>02</span><strong>Suis l’impact</strong><p>Observe les vues, la progression et les retours des étudiants sur tes cours.</p></div><div className="learning-step"><span>03</span><strong>Réponds aux besoins</strong><p>Réponds aux questions, valide les bonnes réponses et accompagne chaque apprenant.</p></div></div>
          </>
        ) : (
          <>
            <div className="section-heading-centered"><span className="hero-badge">UNE MÉTHODE SIMPLE</span><h2>Apprends avec un parcours qui te ressemble.</h2><p>DevLearn relie contenu, pratique et accompagnement dans une expérience fluide.</p></div>
            <div className="learning-steps"><div className="learning-step"><span>01</span><strong>Choisis ton objectif</strong><p>Explore les catégories et trouve le tutoriel adapté à ton niveau.</p></div><div className="learning-step"><span>02</span><strong>Apprends à ton rythme</strong><p>Regarde les vidéos, réponds aux quiz et reprends là où tu t’es arrêté.</p></div><div className="learning-step"><span>03</span><strong>Progresse en communauté</strong><p>Pose tes questions et échange avec les enseignants et les autres étudiants.</p></div></div>
          </>
        )}
      </section>

      <section className="platform-stats-section"><div><strong>{Math.max(500, videos.length * 20)}+</strong><span>cours disponibles</span></div><div><strong>{Math.max(50, visibleCategories.length * 8)}+</strong><span>enseignants passionnés</span></div><div><strong>{studentCount.toLocaleString()}+</strong><span>étudiants actifs</span></div><div><strong>4.9/5</strong><span>expérience moyenne</span></div></section>

      <section className="testimonials-section"><div className="section-heading-centered"><span className="hero-badge">ILS APPRENNENT AVEC DEVLEARN</span><h2>Une communauté qui avance ensemble.</h2></div><div className="testimonial-grid"><blockquote>« J’ai enfin trouvé une plateforme qui me permet de suivre ma progression et de poser mes questions au bon moment. »<cite>— Amina, étudiante en développement web</cite></blockquote><blockquote>« Publier mes tutoriels et voir les étudiants progresser rend mon rôle d’enseignant beaucoup plus concret. »<cite>— Kevin, enseignant DevLearn</cite></blockquote><blockquote>« Les quiz et les réponses du forum transforment une simple vidéo en véritable parcours pédagogique. »<cite>— Thomas, étudiant</cite></blockquote></div></section>

      <section className="home-cta-section"><div><span className="hero-badge">PRÊT À COMMENCER ?</span><h2>Ton prochain progrès commence maintenant.</h2><p>Rejoins une expérience d’apprentissage claire, humaine et orientée résultats.</p></div><button className="btn" onClick={() => document.getElementById('videos-section').scrollIntoView({ behavior: 'smooth' })}>Explorer les cours →</button></section>

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
                  <article className="video-card">
                    <div className="video-thumb-wrap">
                      <img src={video.thumbnailUrl} alt={video.title} className="video-thumb" />
                      <span className="video-play-chip">▶ <span>Voir le cours</span></span>
                      <span className={`video-level-chip level-${getVideoLevel(video).toLowerCase().replace('é', 'e')}`}>{getVideoLevel(video)}</span>
                      <span className="video-duration-chip">{video.duration ? `${Math.ceil(video.duration / 60)} min` : 'Vidéo'}</span>
                    </div>
                    <div className="video-card-body">
                      <div className="video-card-kicker"><span>{video.category?.name || 'Formation'}</span><span className="video-card-rating">★ {video.averageRating || 'Nouveau'}</span></div>
                      <h3 className="video-card-title">{video.title}</h3>
                      <div className="video-teacher-row"><span className="video-teacher-avatar">{video.teacher?.name?.charAt(0) || 'D'}</span><span><strong>{video.teacher?.name || 'Professeur DevLearn'}</strong><small>{video.views || 0} vues · Cours vidéo</small></span></div>
                      {user?.role === 'student' && getProgressForVideo(video._id) ? (
                        <div className="video-card-progress" aria-label="Progression du cours"><div className="progress-label-row"><span>Ta progression</span><strong>{Math.min(100, Math.round((getProgressForVideo(video._id).watchedSeconds / (video.duration || 1)) * 100))}%</strong></div><div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.round((getProgressForVideo(video._id).watchedSeconds / (video.duration || 1)) * 100))}%` }} /></div></div>
                      ) : <div className="video-card-footer"><span>Prêt à apprendre</span><span className="video-card-cta">Continuer <b>→</b></span></div>}
                    </div>
                  </article>
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