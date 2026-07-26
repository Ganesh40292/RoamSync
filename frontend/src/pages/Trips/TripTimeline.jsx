import React, { useState } from 'react';
import { Clock, Plus, MapPin, Compass, Sun, Moon, Sunrise, Sunset, GripVertical } from 'lucide-react';
import tripService from '../../services/tripService';
import './Trips.css';

export default function TripTimeline({ trip, onReload }) {
  const [dayNumber, setDayNumber] = useState(1);
  const [activityName, setActivityName] = useState('');
  const [time, setTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);

  const getTimeBadge = (timeStr = '') => {
    const t = timeStr.toLowerCase();
    if (t.includes('am') || t.includes('morning')) return { label: 'Morning', icon: Sunrise, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
    if (t.includes('noon') || t.includes('pm') && (t.includes('1') || t.includes('2') || t.includes('3') || t.includes('4'))) return { label: 'Afternoon', icon: Sun, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' };
    if (t.includes('evening') || t.includes('5') || t.includes('6') || t.includes('7')) return { label: 'Evening', icon: Sunset, color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' };
    return { label: 'Night', icon: Moon, color: '#ec4899', bg: 'rgba(236,72,153,0.15)' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activityName || !time || !locationName) {
      setError('Please provide activity name, time, and location.');
      return;
    }

    try {
      await tripService.addItinerary(trip.id, {
        dayNumber,
        activityName,
        time,
        locationName,
      });

      setActivityName('');
      setTime('');
      setLocationName('');
      setIsAdding(false);
      setError('');
      if (onReload) onReload();
    } catch (err) {
      console.error(err);
      setError('Failed to add itinerary activity.');
    }
  };

  const groupedItineraries = trip.itineraries
    ? trip.itineraries.reduce((acc, curr) => {
        const day = curr.dayNumber || 1;
        acc[day] = acc[day] || [];
        acc[day].push(curr);
        return acc;
      }, {})
    : {};

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    setDraggedIndex(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.25rem' }}>Travel Schedule & Timeline</h3>
        <button onClick={() => setIsAdding(!isAdding)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <Plus size={16} />
          Add Activity
        </button>
      </div>

      {isAdding && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>Insert Scheduled Activity</h4>
          {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Day #</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={dayNumber}
                  onChange={(e) => setDayNumber(parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Time</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 09:00 AM or Morning"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Activity Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Visit Eiffel Tower 🗼"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Location / Stop</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Champ de Mars, Paris"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}>Save Activity</button>
            </div>
          </form>
        </div>
      )}

      <div className="timeline-list">
        {Object.keys(groupedItineraries).length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Compass size={32} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p>Your itinerary is empty. Press "Add Activity" or use our "Gemini AI Concierge" tab to generate a dynamic schedule!</p>
          </div>
        ) : (
          Object.keys(groupedItineraries)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map((dayNum) => (
              <div key={dayNum} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1.125rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                  Day {dayNum} Schedule
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {groupedItineraries[dayNum].map((item, idx) => {
                    const badge = getTimeBadge(item.time || item.activityDate);
                    const BadgeIcon = badge.icon;
                    return (
                      <div
                        key={idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                        className="timeline-step"
                        style={{
                          padding: '0.875rem',
                          background: draggedIndex === idx ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '8px',
                          borderLeft: `3px solid ${badge.color}`,
                          cursor: 'grab',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <GripVertical size={16} style={{ color: 'var(--text-muted)', cursor: 'grab' }} />
                            <span style={{ fontWeight: 600, color: '#f9fafb', fontSize: '0.925rem' }}>
                              {item.title || item.activityName}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: badge.color,
                              background: badge.bg,
                              border: `1px solid ${badge.color}`,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <BadgeIcon size={12} />
                            {item.time || 'Scheduled'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', paddingLeft: '1.5rem' }}>
                          <MapPin size={12} style={{ color: 'var(--secondary-color)' }} />
                          {item.description || item.locationName || trip.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
