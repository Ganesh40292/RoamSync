import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Compass, Calendar, Users, CheckCircle2, AlertCircle, ArrowRight, Sparkles, LogIn } from 'lucide-react';
import dateFormatter from '../../utils/dateFormatter';
import './Trips.css';

export default function TripJoin() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided. Please check the invitation link.');
      setLoading(false);
      return;
    }

    async function fetchPreview() {
      try {
        const res = await axios.get(`/api/trips/join/preview?token=${encodeURIComponent(token)}`);
        setPreview(res.data);
      } catch (err) {
        console.error('Failed to preview invitation', err);
        const msg = err.response?.data?.message || 'Invalid or expired invitation link.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchPreview();
  }, [token]);

  const handleJoin = async () => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(`/trips/join?token=${token}`)}`);
      return;
    }

    setJoining(true);
    setError('');
    try {
      const authToken = localStorage.getItem('token');
      const res = await axios.post(
        '/api/trips/join',
        { token },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setSuccess(res.data.message || 'Successfully joined the trip!');
      setTimeout(() => {
        navigate(`/trips/${res.data.tripId}`);
      }, 1200);
    } catch (err) {
      console.error('Failed to join trip', err);
      const msg = err.response?.data?.message || 'Failed to join trip. Please try again.';
      setError(msg);
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="trips-container animate-fade-in" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Verifying Travel Invitation...</p>
      </div>
    );
  }

  if (error && !preview) {
    return (
      <div className="trips-container animate-fade-in" style={{ maxWidth: '520px', margin: '4rem auto', padding: '0 1rem' }}>
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
          <AlertCircle size={48} style={{ color: 'var(--danger)' }} />
          <h2 style={{ fontSize: '1.5rem' }}>Invitation Unavailable</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{error}</p>
          <Link to="/trips" className="btn-primary" style={{ marginTop: '0.5rem' }}>
            Browse My Trips
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="trips-container animate-fade-in" style={{ maxWidth: '580px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="glass-card animate-slide-up" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.06, background: 'radial-gradient(circle, var(--primary-color) 0%, transparent 80%)' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.15)', color: 'var(--primary-color)' }}>
            <Compass size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--secondary-color)', fontWeight: 600 }}>
              Group Trip Invitation
            </span>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.1rem' }}>{preview?.tripName}</h2>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.5' }}>
          {preview?.description || 'You have been invited to join this collaborative travel space on RoamSync!'}
        </p>

        {/* Trip Meta details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
            <Calendar size={18} style={{ color: 'var(--primary-color)' }} />
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Schedule</div>
              <span>{dateFormatter.formatShort(preview?.startDate)} - {dateFormatter.formatShort(preview?.endDate)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
            <Users size={18} style={{ color: 'var(--secondary-color)' }} />
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Companions</div>
              <span>{preview?.memberCount || 1} Partners Traveling</span>
            </div>
          </div>
        </div>

        {/* Inviter Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Sparkles size={16} style={{ color: '#f59e0b' }} />
          <span>
            Invited by <strong style={{ color: 'var(--text-primary)' }}>@{preview?.inviterUsername}</strong>
          </span>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Action Button */}
        <div style={{ marginTop: '0.5rem' }}>
          {isLoggedIn ? (
            <button
              onClick={handleJoin}
              disabled={joining || !!success}
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              {joining ? 'Joining Group...' : 'Accept & Join Adventure'}
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleJoin}
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              <LogIn size={18} />
              Sign In to Join Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
