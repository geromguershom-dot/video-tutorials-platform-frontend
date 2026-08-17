import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BADGES = [
  { icon: '🚀', title: 'Premier pas', text: 'Se connecter à DevLearn' },
  { icon: '🎬', title: 'Curieux', text: 'Commencer une vidéo' },
  { icon: '🏅', title: 'En progression', text: 'Terminer un tutoriel' },
  { icon: '💬', title: 'Esprit communautaire', text: 'Participer au forum' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [videosRes, progressRes] = await Promise.all([api.get('/videos'), api.get('/progress')]);
        setVideos(videosRes.data || []);
        setProgress(progressRes.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const completed = progress.filter((item) => item.completed).length;
  const watchedSeconds = progress.reduce((sum, item) => sum + (item.watchedSeconds || 0), 0);
  const progressPercent = videos.length ? Math.min(100, Math.round((completed / videos.length) * 100)) : 0;
  const nextVideo = useMemo(() => videos.find((video) => !progress.some((item) => item.video?._id === video._id && item.completed)) || videos[0], [videos, progress]);
  const unlocked = new Set(['Premier pas']);
  if (progress.length > 0) unlocked.add('Curieux');
  if (completed > 0) unlocked.add('En progression');

  if (!user) {
    return <div className="empty-state-card"><span className="empty-state-icon">🔐</span><h2>Connecte-toi pour voir ton tableau de bord</h2><Link className="btn" to="/login">Se connecter</Link></div>;
  }

  if (user.role !== 'student') {
    return <Navigate to="/upload" replace />;
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="hero-badge">TON ESPACE D’APPRENTISSAGE</span>
          <h1>Continue à progresser, {user.name?.split(' ')[0]}.</h1>
          <p>Chaque vidéo regardée te rapproche de ton prochain objectif.</p>
        </div>
        <div className="dashboard-ring" style={{ '--progress': `${progressPercent * 3.6}deg` }}><strong>{progressPercent}%</strong><span>progression</span></div>
      </section>

      <section className="dashboard-stat-grid">
        <div className="dashboard-stat"><span className="stat-icon">🎯</span><strong>{completed}</strong><small>Cours terminés</small></div>
        <div className="dashboard-stat"><span className="stat-icon">⏱</span><strong>{Math.floor(watchedSeconds / 60)} min</strong><small>Temps d’apprentissage</small></div>
        <div className="dashboard-stat"><span className="stat-icon">🔥</span><strong>{progress.length > 0 ? 'Actif' : 'Prêt'}</strong><small>Statut actuel</small></div>
      </section>

      <div className="dashboard-content-grid">
        <section className="dashboard-panel">
          <div className="section-header"><div><span className="eyebrow">PROCHAINE ÉTAPE</span><h2>Reprendre l’apprentissage</h2></div></div>
          {loading ? <p className="muted-text">Chargement de ton parcours...</p> : nextVideo ? (
            <Link to={`/video/${nextVideo._id}`} className="continue-card">
              <img src={nextVideo.thumbnailUrl} alt="" />
              <div><span className="tag">{nextVideo.category?.name || 'Tutoriel'}</span><h3>{nextVideo.title}</h3><p>Continue là où tu t’es arrêté.</p><span className="continue-link">Ouvrir le tutoriel →</span></div>
            </Link>
          ) : <p className="muted-text">Aucun tutoriel disponible pour le moment.</p>}
        </section>

        <section className="dashboard-panel">
          <div className="section-header"><div><span className="eyebrow">COLLECTION</span><h2>Mes badges</h2></div><span className="badge-count">{unlocked.size}/{BADGES.length}</span></div>
          <div className="badge-grid">{BADGES.map((badge) => <div className={`achievement-badge ${unlocked.has(badge.title) ? 'unlocked' : ''}`} key={badge.title}><span>{badge.icon}</span><strong>{badge.title}</strong><small>{badge.text}</small></div>)}</div>
        </section>
      </div>

      <section className="dashboard-panel dashboard-progress-panel"><div className="section-header"><div><span className="eyebrow">VUE D’ENSEMBLE</span><h2>Ta progression récente</h2></div><Link to="/" className="text-link">Explorer les cours →</Link></div>{progress.length === 0 ? <p className="muted-text">Regarde ton premier tutoriel pour commencer à construire ton parcours.</p> : <div className="dashboard-progress-list">{progress.slice(0, 4).map((item) => { const percent = item.video?.duration ? Math.min(100, Math.round((item.watchedSeconds / item.video.duration) * 100)) : item.completed ? 100 : 0; return <div className="dashboard-progress-item" key={item._id}><div><strong>{item.video?.title || 'Tutoriel'}</strong><small>{item.completed ? 'Terminé' : `${percent}% regardé`}</small></div><div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${percent}%` }} /></div></div>; })}</div>}</section>
    </div>
  );
}
