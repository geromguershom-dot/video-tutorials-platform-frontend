import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/videos').then((res) => setVideos(res.data || [])).finally(() => setLoading(false));
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'teacher' && user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  const myVideos = useMemo(() => videos.filter((video) => !video.teacher?._id || video.teacher?._id === user._id), [videos, user._id]);
  const totalViews = myVideos.reduce((sum, video) => sum + (video.views || 0), 0);
  const averageRating = myVideos.length ? (myVideos.reduce((sum, video) => sum + (video.averageRating || 0), 0) / myVideos.length).toFixed(1) : '—';
  const reach = Math.max(0, Math.round(totalViews * 1.8));

  return <div className="teacher-dashboard-page">
    <section className="teacher-dashboard-hero"><div><span className="hero-badge teacher-badge">ESPACE ENSEIGNANT</span><h1>Partage ton expertise, {user.name?.split(' ')[0]}.</h1><p>Publie des cours utiles et suis l’impact de tes contenus auprès des apprenants.</p><div className="teacher-hero-actions"><Link to="/upload" className="btn">+ Publier un cours</Link><span className="teacher-focus-chip">{myVideos.length ? 'STUDIO ACTIF' : 'PRÊT À PUBLIER'}</span></div></div><div className="teacher-hero-mark"><strong>{myVideos.length}</strong><span>cours<br />en ligne</span></div></section>
    <section className="teacher-stat-grid teacher-stat-grid-featured"><div className="teacher-stat"><span>▣</span><strong>{myVideos.length}</strong><small>Cours publiés</small></div><div className="teacher-stat"><span>◉</span><strong>{totalViews}</strong><small>Vues cumulées</small></div><div className="teacher-stat"><span>♧</span><strong>{reach}+</strong><small>Étudiants touchés</small></div><div className="teacher-stat"><span>★</span><strong>{averageRating}</strong><small>Note moyenne</small></div></section>
    <section className="teacher-dashboard-panel"><div className="section-header"><div><span className="eyebrow">BIBLIOTHÈQUE</span><h2>Tes cours récents</h2></div><Link to="/upload" className="text-link">Ajouter un cours →</Link></div>{loading ? <p className="muted-text">Chargement de tes cours...</p> : myVideos.length === 0 ? <div className="teacher-empty-state"><strong>Ton prochain cours peut commencer ici.</strong><p>Publie ton premier tutoriel pour accompagner les étudiants.</p><Link className="btn" to="/upload">Créer mon premier cours</Link></div> : <div className="teacher-course-list">{myVideos.slice(0, 6).map((video) => <Link className="teacher-course-row" to={`/video/${video._id}`} key={video._id}><img src={video.thumbnailUrl} alt="" /><div><strong>{video.title}</strong><small>{video.category?.name || 'Formation'} · {video.views || 0} vues</small></div><span>Voir →</span></Link>)}</div>}</section>
  </div>;
}
