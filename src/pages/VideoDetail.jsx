import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
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

  const fetchVideo = async () => {
    const res = await api.get(`/videos/${id}`);
    setVideo(res.data);
  };

  const fetchComments = async () => {
    const res = await api.get(`/comments/video/${id}`);
    setComments(res.data);
  };

  useEffect(() => {
    fetchVideo();
    fetchComments();
  }, [id]);

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

  if (!video) return <p>Chargement...</p>;

  return (
    <div>
      <video
        ref={videoRef}
        src={video.videoUrl}
        controls
        onTimeUpdate={handleTimeUpdate}
        style={{ width: '100%', maxHeight: 500, borderRadius: 10, background: '#000' }}
      />

      <h2 style={{ marginTop: 15 }}>{video.title}</h2>
      <p style={{ color: '#666' }}>
        Par {video.teacher?.name} · {video.category?.name} · 👁 {video.views} vues
      </p>
      <p style={{ marginTop: 10 }}>{video.description}</p>

      <div style={{ margin: '15px 0' }}>
        <strong>Noter cette vidéo :</strong>{' '}
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => handleRating(star)}
            style={{
              cursor: 'pointer',
              fontSize: 22,
              color: star <= myRating ? '#f59e0b' : '#cbd5e1',
            }}
          >
            ★
          </span>
        ))}{' '}
        <span style={{ fontSize: 13, color: '#666' }}>
          (Moyenne : {video.averageRating || 0}/5)
        </span>
      </div>

      <div className="card">
        <h3>Commentaires ({comments.length})</h3>
        {user && (
          <form onSubmit={handleCommentSubmit} style={{ marginTop: 10 }}>
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
        <div style={{ marginTop: 15 }}>
          {comments.map((c) => (
            <div key={c._id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <strong>{c.author?.name}</strong>{' '}
              <span className="tag">{c.author?.role}</span>
              <p>{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}