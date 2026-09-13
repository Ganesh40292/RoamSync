import React, { useState } from 'react';
import { Star, MessageSquare, BookOpen, Send, CheckCircle2 } from 'lucide-react';

export default function TripReviewWidget({ tripId }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [savedReviews, setSavedReviews] = useState([
    { id: 1, author: 'Sarah', rating: 5, text: 'Amazing trip to Mysore Palace & Coorg! Unforgettable filter coffee & sunset views 🌅', date: 'Yesterday' },
  ]);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const newRev = {
      id: Date.now(),
      author: 'You',
      rating,
      text: reviewText.trim(),
      date: 'Just now',
    };

    setSavedReviews([newRev, ...savedReviews]);
    setReviewText('');
    setStatusMsg('Memory review added to travel journal! [Local Session Only]');
    setTimeout(() => setStatusMsg(null), 3500);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BookOpen size={20} style={{ color: 'var(--primary-color)' }} />
        <h4 style={{ fontSize: '1rem' }}>Trip Journal & Memory Reviews <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>[Local Session Only]</span></h4>
      </div>

      {statusMsg && (
        <div style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', background: 'rgba(16,185,129,0.15)', color: '#a7f3d0', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckCircle2 size={14} /> {statusMsg}
        </div>
      )}

      {/* Star Rating Input */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={20}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              style={{
                cursor: 'pointer',
                color: (hoverRating || rating) >= star ? '#fcd34d' : 'var(--text-muted)',
                fill: (hoverRating || rating) >= star ? '#fcd34d' : 'none',
              }}
            />
          ))}
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>
            {rating} / 5 Stars
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Log your trip memory highlights..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            style={{ flexGrow: 1, fontSize: '0.85rem' }}
            required
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Send size={14} /> Post
          </button>
        </div>
      </form>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
        {savedReviews.map((r) => (
          <div key={r.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>@{r.author}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Star size={12} fill="#fcd34d" color="#fcd34d" />
                <span style={{ fontSize: '0.75rem', color: '#fcd34d', fontWeight: 'bold' }}>{r.rating}.0</span>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
