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
    <div>
      <h2>Forum Questions-Réponses</h2>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ maxWidth: 300, margin: '15px 0' }}
      >
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      {user && (
        <div className="card">
          <h3>Poser une question</h3>
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
          <p>Aucune question pour cette matière.</p>
        ) : (
          questions.map((q) => (
            <div key={q._id} className="card">
              <strong>{q.author?.name}</strong> <span className="tag">{q.author?.role}</span>
              <p style={{ margin: '8px 0' }}>{q.content}</p>
              <button className="btn" onClick={() => toggleAnswers(q._id)}>
                {openQuestion === q._id ? 'Masquer' : 'Voir'} les réponses
              </button>

              {openQuestion === q._id && (
                <div style={{ marginTop: 15, paddingLeft: 15, borderLeft: '3px solid #e2e8f0' }}>
                  {(answers[q._id] || []).map((a) => (
                    <div key={a._id} style={{ marginBottom: 10 }}>
                      <strong>{a.author?.name}</strong>{' '}
                      <span className="tag">{a.author?.role}</span>
                      <p>{a.content}</p>
                    </div>
                  ))}
                  {(answers[q._id] || []).length === 0 && <p>Aucune réponse pour l'instant.</p>}

                  {user && (
                    <div style={{ marginTop: 10 }}>
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