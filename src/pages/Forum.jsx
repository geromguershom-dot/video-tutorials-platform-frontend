import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Forum() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [answers, setAnswers] = useState({});
  const [newAnswer, setNewAnswer] = useState({});
  const [openQuestion, setOpenQuestion] = useState(null);

  useEffect(() => {
    api.get('/categories').then((res) => {
      setCategories(res.data);
      if (res.data.length > 0) setCategory(res.data[0]._id);
    });
  }, []);

  const fetchQuestions = async () => {
    if (!category) return;
    const res = await api.get(`/comments/questions/${category}`);
    setQuestions(res.data);
  };

  useEffect(() => {
    fetchQuestions();
  }, [category]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    try {
      await api.post('/comments/question', { content: newQuestion, category });
      setNewQuestion('');
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const toggleAnswers = async (questionId) => {
    if (openQuestion === questionId) {
      setOpenQuestion(null);
      return;
    }
    setOpenQuestion(questionId);
    const res = await api.get(`/comments/answers/${questionId}`);
    setAnswers((prev) => ({ ...prev, [questionId]: res.data }));
  };

  const visibleCategories = categories.filter((cat, index, list) => index === list.findIndex((item) => item.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === cat.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()));

  const handleAnswerSubmit = async (questionId) => {
    const content = newAnswer[questionId];
    if (!content?.trim()) return;
    try {
      await api.post('/comments/answer', { content, parentQuestion: questionId });
      setNewAnswer((prev) => ({ ...prev, [questionId]: '' }));
      const res = await api.get(`/comments/answers/${questionId}`);
      setAnswers((prev) => ({ ...prev, [questionId]: res.data }));
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div className="forum-page">
      <div className="forum-hero">
        <div>
          <span className="hero-badge">COMMUNAUTÉ DEVLEARN</span>
          <h2>💬 Apprendre ensemble, progresser plus vite.</h2>
          <p>Pose une question, partage une méthode et profite de l’expérience des enseignants.</p>
        </div>
        <div className="forum-hero-mark">Q<span>&amp;</span>A</div>
      </div>
      <div className="forum-stat-row">
        <span><strong>{questions.length}</strong><small>Questions dans cette matière</small></span>
        <span><strong>{visibleCategories.length}</strong><small>Matières disponibles</small></span>
        <span><strong>24 h</strong><small>Pour obtenir de l’aide</small></span>
      </div>

      <div className="forum-filter-row">
        <span className="filter-label">Explorer une matière</span>
        <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
          className="forum-category-select"
        >
        {visibleCategories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
        </select>
      </div>

      {user && (
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Poser une question</h3>
          <form onSubmit={handleAskQuestion}>
            <textarea
              rows={2}
              placeholder="Votre question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <button className="btn" type="submit">
              Publier la question
            </button>
          </form>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        {questions.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Aucune question pour cette matière pour l'instant.</p>
        ) : (
          questions.map((q) => (
            <div key={q._id} className="card question-card">
              <div className="question-card-topline"><span className="question-topic">Question ouverte</span><span>● active</span></div>
              <div className="comment-author-row">
                <div className="avatar-circle small">{q.author?.name?.charAt(0)}</div>
                <strong>{q.author?.name}</strong>
                <span className="tag">{q.author?.role}</span>
              </div>
              <p className="question-content">{q.content}</p>
              <div className="question-card-actions">
                <span className="question-replies">{(answers[q._id] || []).length} réponse(s)</span>
                <button className="btn btn-outline" onClick={() => toggleAnswers(q._id)}>
                {openQuestion === q._id ? 'Masquer' : 'Voir'} les réponses
              </button>

                              </div>

              {openQuestion === q._id && (

                <div className="answers-box">
                  {(answers[q._id] || []).map((a) => (
                    <div key={a._id} className="answer-item">
                      <div className="comment-author-row">
                        <div className="avatar-circle small">{a.author?.name?.charAt(0)}</div>
                        <strong>{a.author?.name}</strong>
                        <span className="tag">{a.author?.role}</span>
                      </div>
                      <p className="comment-content">{a.content}</p>
                    </div>
                  ))}
                  {(answers[q._id] || []).length === 0 && (
                    <p style={{ color: '#94a3b8', fontSize: 13 }}>
                      Aucune réponse pour l'instant.
                    </p>
                  )}

                  {user && (
                    <div style={{ marginTop: 12 }}>
                      <textarea
                        rows={2}
                        placeholder="Votre réponse..."
                        value={newAnswer[q._id] || ''}
                        onChange={(e) =>
                          setNewAnswer((prev) => ({ ...prev, [q._id]: e.target.value }))
                        }
                      />
                      <button className="btn" onClick={() => handleAnswerSubmit(q._id)}>
                        Répondre
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}