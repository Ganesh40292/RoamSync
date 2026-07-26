import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, FileText, Compass, Plus, Trash } from 'lucide-react';
import tripService from '../../services/tripService';
import './Trips.css';

export default function CreateTrip() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [invitee, setInvitee] = useState('');
  const [invitees, setInvitees] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddInvitee = (e) => {
    e.preventDefault();
    if (invitee.trim() && !invitees.includes(invitee.trim())) {
      setInvitees([...invitees, invitee.trim()]);
      setInvitee('');
    }
  };

  const handleRemoveInvitee = (index) => {
    setInvitees(invitees.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      setError('Please provide a title and travel dates.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const trip = await tripService.createTrip({
        title,
        description,
        startDate,
        endDate,
      });

      for (const username of invitees) {
        try {
          await tripService.inviteMember(trip.id, username);
        } catch (inviteErr) {
          console.error(`Failed to invite user: ${username}`, inviteErr);
        }
      }

      navigate('/trips');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create trip. Please verify dates.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="trips-container animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Plan an Adventure</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Initialize travel durations and bring your friends along!</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Trip Title</label>
            <div style={{ position: 'relative' }}>
              <Compass size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '40px', width: '100%' }}
                placeholder="e.g. Summer in Paris 🗼"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <div style={{ position: 'relative' }}>
              <FileText size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <textarea
                className="form-input"
                style={{ paddingLeft: '40px', width: '100%', minHeight: '80px', fontFamily: 'var(--font-body)' }}
                placeholder="What is the goal of this journey?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                style={{ width: '100%' }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">End Date</label>
              <input
                type="date"
                className="form-input"
                style={{ width: '100%' }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Invite Friends</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                style={{ flexGrow: 1 }}
                placeholder="Search friend by username..."
                value={invitee}
                onChange={(e) => setInvitee(e.target.value)}
              />
              <button type="button" onClick={handleAddInvitee} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '46px', padding: 0 }}>
                <Plus size={20} />
              </button>
            </div>

            {invitees.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {invitees.map((username, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'rgba(124, 58, 237, 0.15)',
                      border: '1px solid var(--primary-color)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {username}
                    <Trash size={12} style={{ color: 'var(--danger)', cursor: 'pointer' }} onClick={() => handleRemoveInvitee(index)} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Link to="/trips" className="btn-secondary" style={{ flexGrow: 1, textAlign: 'center' }}>Cancel</Link>
            <button type="submit" className="btn-primary animate-pulse-glow" style={{ flexGrow: 2 }} disabled={isLoading}>
              {isLoading ? 'Creating Trip...' : 'Create Adventure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
