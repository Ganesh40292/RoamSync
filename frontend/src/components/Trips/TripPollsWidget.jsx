import React, { useState, useEffect } from 'react';
import { Vote, Plus, Check, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function TripPollsWidget({ tripId }) {
  const [polls, setPolls] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPolls = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/trips/${tripId}/polls`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      setPolls(res.data);
    } catch (err) {
      console.error('Failed to fetch polls:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) fetchPolls();
  }, [tripId]);

  const handleVote = async (optionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/trips/${tripId}/polls/vote/${optionId}`, {}, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      fetchPolls();
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const validOptions = options.filter((o) => o.trim().length > 0);
    if (!question || validOptions.length < 2) {
      alert('Please enter a question and at least 2 options.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/trips/${tripId}/polls`, { question, options: validOptions }, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      setQuestion('');
      setOptions(['', '']);
      setShowCreate(false);
      fetchPolls();
    } catch (err) {
      console.error('Create poll failed:', err);
    }
  };

  if (isLoading) return null;

  return (
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Vote size={20} style={{ color: 'var(--secondary-color)' }} />
          <h4 style={{ fontSize: '1rem' }}>Group Polls & Decision Voting</h4>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Plus size={14} /> {showCreate ? 'Cancel' : 'New Poll'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreatePoll} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <input type="text" placeholder="e.g. Which restaurant for Day 2 dinner?" value={question} onChange={(e) => setQuestion(e.target.value)} className="form-input" style={{ fontSize: '0.85rem' }} required />
          {options.map((opt, idx) => (
            <input key={idx} type="text" placeholder={`Option ${idx + 1}`} value={opt} onChange={(e) => {
              const updated = [...options];
              updated[idx] = e.target.value;
              setOptions(updated);
            }} className="form-input" style={{ fontSize: '0.8rem' }} required />
          ))}
          <button type="button" onClick={() => setOptions([...options, ''])} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem' }}>+ Add Option</button>
          <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem' }}>Publish Group Poll</button>
        </form>
      )}

      {polls.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No active polls. Create one to vote on activities with your group!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {polls.map((poll) => (
            <div key={poll.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.875rem', borderRadius: '8px', borderLeft: '3px solid var(--primary-color)' }}>
              <strong style={{ fontSize: '0.9rem', color: '#f3f4f6', display: 'block', marginBottom: '0.6rem' }}>{poll.question}</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {poll.options?.map((opt) => {
                  const voteCount = opt.voters?.length || 0;
                  return (
                    <button key={opt.id} onClick={() => handleVote(opt.id)} className="btn-secondary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.8rem', fontSize: '0.8rem', textAlign: 'left', background: 'rgba(255,255,255,0.03)' }}>
                      <span>{opt.optionText}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', fontWeight: 'bold' }}>{voteCount} votes</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
