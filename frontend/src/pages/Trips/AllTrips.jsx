import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Compass, Search, Filter, Clock } from 'lucide-react';
import tripService from '../../services/tripService';
import dateFormatter from '../../utils/dateFormatter';
import './Trips.css';

export default function AllTrips() {
  const [trips, setTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTrips() {
      try {
        const fetched = await tripService.getAllTrips();
        setTrips(fetched);
      } catch (e) {
        console.error('Failed to load trips', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadTrips();
  }, []);

  const getTripStatus = (startDateStr, endDateStr) => {
    const now = new Date();
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (now < start) return { label: 'Upcoming', class: 'status-upcoming', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' };
    if (now >= start && now <= end) return { label: 'In Progress', class: 'status-active', color: '#10b981', bg: 'rgba(16,185,129,0.15)' };
    return { label: 'Completed', class: 'status-completed', color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' };
  };

  const getDaysCountdown = (startDateStr) => {
    const now = new Date();
    const start = new Date(startDateStr);
    const diffTime = start - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return `${diffDays} days away`;
    if (diffDays === 0) return 'Starts today!';
    return 'In progress / Past';
  };

  const filteredTrips = trips.filter((t) => {
    const title = (t.name || t.title || '').toLowerCase();
    const desc = (t.description || '').toLowerCase();
    const matchesSearch = title.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'ALL') return matchesSearch;
    const status = getTripStatus(t.startDate, t.endDate).label.toUpperCase().replace(' ', '_');
    return matchesSearch && status === filterStatus;
  });

  const defaultImages = [
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600100397608-f010e42ed97c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1588598126702-86927bf49a0d?auto=format&fit=crop&w=800&q=80',
  ];

  if (isLoading) {
    return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '4rem' }}>Synchronizing Trips...</div>;
  }

  return (
    <div className="trips-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Your Adventures</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Manage and sync all your collaborative travel itineraries</p>
        </div>
        <Link to="/trips/create" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} />
          Create Trip
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search trips by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
          >
            <option value="ALL" style={{ background: '#1e1b4b' }}>All Trips ({trips.length})</option>
            <option value="UPCOMING" style={{ background: '#1e1b4b' }}>Upcoming</option>
            <option value="IN_PROGRESS" style={{ background: '#1e1b4b' }}>In Progress</option>
            <option value="COMPLETED" style={{ background: '#1e1b4b' }}>Completed</option>
          </select>
        </div>
      </div>

      {filteredTrips.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <Compass size={48} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '1.25rem' }}>No matching adventures found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
            Try adjusting your search criteria or create a new trip to start planning!
          </p>
          <Link to="/trips/create" className="btn-primary">Get Started</Link>
        </div>
      ) : (
        <div className="trips-grid grid-3-col">
          {filteredTrips.map((trip, idx) => {
            const st = getTripStatus(trip.startDate, trip.endDate);
            const countdown = getDaysCountdown(trip.startDate);
            const fallbackSrc = defaultImages[idx % defaultImages.length];

            return (
              <div key={trip.id} className="trip-card glass-card animate-slide-up">
                <div style={{ position: 'relative', height: '160px', width: '100%', overflow: 'hidden' }}>
                  <img
                    src={trip.imageUrl || fallbackSrc}
                    alt={trip.name || trip.title}
                    onError={(e) => { e.target.src = fallbackSrc; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Dynamic Status Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: st.bg,
                      color: st.color,
                      border: `1px solid ${st.color}`,
                      padding: '0.25rem 0.6rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {st.label}
                  </div>
                </div>

                <div className="trip-card-body">
                  <h3 className="trip-card-title">{trip.name || trip.title}</h3>
                  <div className="trip-card-dates">
                    <Calendar size={16} />
                    <span>{dateFormatter.formatShort(trip.startDate)} - {dateFormatter.formatShort(trip.endDate)}</span>
                  </div>

                  {/* Countdown Timer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--secondary-color)', margin: '0.25rem 0' }}>
                    <Clock size={12} />
                    <span>{countdown}</span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineBreak: 'anywhere' }}>
                    {trip.description || 'No description provided.'}
                  </p>

                  <div className="trip-card-footer">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {trip.members?.length || 1} {trip.members?.length === 1 ? 'member' : 'members'}
                    </span>
                    <Link to={`/trips/${trip.id}`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                      Open Trip
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
