import React, { useState, useEffect } from 'react';
import { X, Copy, Check, UserPlus, QrCode, Mail, Link as LinkIcon, AlertCircle, RefreshCw } from 'lucide-react';
import tripService from '../../services/tripService';
import QrCodeCanvas from '../Common/QrCodeCanvas';

export default function InChatInviteModal({ isOpen, onClose, trip, onCompanionAdded }) {
  const [inviteInput, setInviteInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('DIRECT'); // 'DIRECT' | 'LINK' | 'QR'
  const [inviteLink, setInviteLink] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInviteLink = async () => {
    if (!trip?.id) return;
    setLinkLoading(true);
    try {
      const data = await tripService.createInvitation(trip.id);
      setInviteLink(`${window.location.origin}${data.joinUrl}`);
    } catch (err) {
      console.error('Failed to generate invite', err);
      setInviteLink(`${window.location.origin}/trips/join`);
    } finally {
      setLinkLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && trip?.id && (activeTab === 'LINK' || activeTab === 'QR') && !inviteLink) {
      fetchInviteLink();
    }
  }, [isOpen, trip?.id, activeTab]);

  if (!isOpen || !trip) return null;

  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleAddCompanion = async (e) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;

    const username = inviteInput.trim();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      await tripService.addMember(trip.id, username);
      setStatusMsg({ type: 'success', text: `Added @${username} to trip!` });
      setInviteInput('');
      if (onCompanionAdded) onCompanionAdded({ username });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      console.error('Failed to add companion', err);
      const errMsg = err.response?.data?.message || `User @${username} not found or could not be added.`;
      setStatusMsg({ type: 'error', text: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // SVG QR code rendering
  const qrSvg = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(inviteLink || window.location.href)}&color=7c3aed&bgcolor=ffffff`;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
      <div className="glass-card animate-scale-up" style={{ width: '100%', maxWidth: '440px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', border: '1px solid var(--primary-color)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} style={{ color: 'var(--primary-color)' }} />
            Invite Companions to Chat
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Add travel partners to <strong>{trip.name || trip.title}</strong> chat room
          </p>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('DIRECT')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'DIRECT' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'DIRECT' ? 'bold' : 'normal',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Mail size={14} /> Add Username
          </button>
          <button
            onClick={() => { setActiveTab('LINK'); if (!inviteLink) fetchInviteLink(); }}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'LINK' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'LINK' ? 'bold' : 'normal',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <LinkIcon size={14} /> Copy Link
          </button>
          <button
            onClick={() => { setActiveTab('QR'); if (!inviteLink) fetchInviteLink(); }}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'QR' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'QR' ? 'bold' : 'normal',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <QrCode size={14} /> QR Code
          </button>
        </div>

        {statusMsg && (
          <div style={{
            padding: '0.6rem 0.8rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            background: statusMsg.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
            color: statusMsg.type === 'error' ? 'var(--danger)' : '#a7f3d0',
            border: `1px solid ${statusMsg.type === 'error' ? 'var(--danger)' : 'rgba(16,185,129,0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            {statusMsg.type === 'error' && <AlertCircle size={14} />}
            {statusMsg.text}
          </div>
        )}

        {/* Tab 1: Username Direct Add */}
        {activeTab === 'DIRECT' && (
          <form onSubmit={handleAddCompanion} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Enter companion registered username:</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. sarah_travels"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                style={{ flexGrow: 1, fontSize: '0.85rem' }}
                required
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <UserPlus size={14} /> {isSubmitting ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Copyable Link */}
        {activeTab === 'LINK' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Shareable Trip Link:</label>
            {linkLoading ? (
              <div style={{ padding: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <RefreshCw size={14} className="animate-spin" /> Generating link...
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.8rem', flexGrow: 1, outline: 'none' }}
                />
                <button onClick={handleCopyLink} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {isCopied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: QR Code */}
        {activeTab === 'QR' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
            <div style={{ padding: '0.5rem', background: '#fff', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <QrCodeCanvas value={inviteLink || `${window.location.origin}/trips/join`} size={150} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Scan with mobile camera to join trip</span>
            <span style={{ fontSize: '0.7rem', color: '#10b981' }}>⏱️ Invitation code active</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Done</button>
        </div>
      </div>
    </div>
  );
}
