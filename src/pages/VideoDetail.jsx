import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VideoDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const videoRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [playlistContext, setPlaylistContext] = useState(null);

  const fetchVideo = async () => {
    const res = await api.get(`/videos/${id}`);
    setVideo(res.data);
  };

  const fetchComments = async () => {
    const res = await api.get(`/comments/video/${id}`);
    setComments(res.data);
  };

  const fetchPlaylistContext = async () => {
    if (!user) {
      setPlaylistContext(null);
      return;
    }
    try {
      const res = await api.get('/playlists');
      const match = res.data.find((pl) => pl.videos.some((v) => v._id === id));
      setPlaylistContext(match || null);
    } catch (err) {
      setPlaylistContext(null);
    }
  };

  useEffect(() => {
    fetchVideo();
    fetchComments();
    fetchPlaylistContext();
  }, [id, user]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post('/comments', { content: newComment, video: id });
      setNewComment('');
      fetchComments();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handleRating = async (value) => {
    try {
      await api.post('/ratings', { value, video: id });
      setMyRating(value);
      fetchVideo();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handleTimeUpdate = () => {
    if (!user || !videoRef.current) return;
    const watchedSeconds = Math.floor(videoRef.current.currentTime);
    if (watchedSeconds > 0 && watchedSeconds % 5 === 0) {
      api.put('/progress', { video: id, watchedSeconds }).catch(() => {});
    }
  };

  if (!video) return <p style={{ color: '#94a3b8' }}>Chargement...</p>;

  return (
    <div className="video-detail-layout">
      <div className="video-detail-main">
        <Link to="/" className="back-link">
          ← Retour aux vidéos
        </Link>

        <div className="video-player-wrap">
          <video
            ref={videoRef}
            src={video.videoUrl}
            controls
            onTimeUpdate={handleTimeUpdate}
            className="video-player"
          />
        </div>

        <h1 className="video-detail-title">{video.title}</h1>

        <div className="video-detail-meta">
          <div className="video-detail-author">
            <div className="avatar-circle">{video.teacher?.name?.charAt(0)}</div>
            <div>
              <div className="user-name">{video.teacher?.name}</div>
              <div className="user-role">{video.category?.name}</div>
            </div>
          </div>
          <div className="video-detail-stats">
            <span>👁 {video.views} vues</span>
          </div>
        </div>

        <div className="rating-box">
          <span className="rating-label">Noter cette vidéo :</span>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => handleRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="star"
                style={{
                  color: star <= (hoverRating || myRating) ? '#f59e0b' : '#3d3a56',
                }}
              >
                ★
              </span>
            ))}
          </div>
          <span className="rating-average">Moyenne : {video.averageRating || 0}/5</span>
        </div>

        <div className="card">
          <p className="video-description">{video.description}</p>
        </div>

        <div className="card">
          <h3 className="comments-title">💬 Commentaires ({comments.length})</h3>
          {user && (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                rows={2}
                placeholder="Ajouter un commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button className="btn" type="submit">
                Publier
              </button>
            </form>
          )}
          <div className="comments-list">
            {comments.length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>
                Aucun commentaire pour l'instant. Sois le premier !
              </p>
            )}
            {comments.map((c) => (
              <div key={c._id} className="comment-item">
                <div className="avatar-circle small">{c.author?.name?.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div className="comment-author-row">
                    <strong>{c.author?.name}</strong>
                    <span className="tag">{c.author?.role}</span>
                  </div>
                  <p className="comment-content">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {playlistContext && (
        <div className="video-detail-side">
          <div className="side-card playlist-sommaire">
            <h3>📋 {playlistContext.title}</h3>
            <p className="playlist-sommaire-count">
              {playlistContext.videos.length} vidéo(s) dans cette playlist
            </p>
            <div className="playlist-sommaire-list">
              {playlistContext.videos.map((v, index) => (
                <Link
                  to={`/video/${v._id}`}
                  key={v._id}
                  className={`playlist-sommaire-item ${v._id === id ? 'current' : ''}`}
                >
                  <span className="playlist-sommaire-number">{index + 1}</span>
                  <img
                    src={v.thumbnailUrl}
                    alt={v.title}
                    className="playlist-sommaire-thumb"
                  />
                  <div>
                    <div className="playlist-sommaire-title">{v.title}</div>
                    {v.duration && (
                      <div className="playlist-sommaire-duration">
                        {Math.floor(v.duration / 60)}:
                        {String(Math.floor(v.duration % 60)).padStart(2, '0')}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}