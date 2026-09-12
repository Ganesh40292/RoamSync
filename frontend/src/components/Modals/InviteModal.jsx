import React, { useState, useEffect } from 'react';
import { Copy, Check, X, UserPlus, AlertCircle, RefreshCw } from 'lucide-react';
import tripService from '../../services/tripService';

export default function InviteModal({ trip, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateLink = async () => {
    if (!trip?.id) return;
    setLoading(true);
    setError('');
    try {
      const data = await tripService.createInvitation(trip.id);
      const fullUrl = `${window.location.origin}${data.joinUrl}`;
      setInviteUrl(fullUrl);
    } catch (err) {
      console.error('Failed to generate invite', err);
      setError(err.response?.data?.message || 'Failed to generate invitation link. You must be an Organizer or Owner.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && trip?.id) {
      generateLink();
    }
  }, [isOpen, trip?.id]);

  if (!isOpen || !trip) return null;

  const copyToClipboard = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="glass-card animate-scale-up" style={{ padding: '2rem', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', textAlign: 'center' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
            <UserPlus size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem' }}>Invite Friends to {trip.name || trip.title}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Share this cryptographically secure invite link to invite companions to your trip space!
          </p>
        </div>

        {error ? (
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <div style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} className="animate-spin" /> Generating secure link...
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
            <input
              type="text"
              readOnly
              value={inviteUrl}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.78rem', width: '100%', outline: 'none' }}
            />
            <button
              onClick={copyToClipboard}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}
            >
              {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Link'}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.5rem' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
