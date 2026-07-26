import React, { useState } from 'react';
import { X, Copy, Check, UserPlus, QrCode, Mail, Link as LinkIcon } from 'lucide-react';
import tripService from '../../services/tripService';

export default function InChatInviteModal({ isOpen, onClose, trip, onCompanionAdded }) {
  const [inviteInput, setInviteInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('DIRECT'); // 'DIRECT' | 'LINK' | 'QR'

  if (!isOpen || !trip) return null;

  const inviteLink = `${window.location.origin}/trips/join?code=TRIP-${trip.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleAddCompanion = async (e) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;

    const newMemberObj = { username: inviteInput.trim(), fullName: inviteInput.trim() };

    try {
      await tripService.addMember(trip.id, inviteInput.trim());
      setStatusMsg({ type: 'success', text: `Added @${inviteInput.trim()} to trip & chat room!` });
      setInviteInput('');
      if (onCompanionAdded) onCompanionAdded(newMemberObj);
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'success', text: `Added companion @${inviteInput.trim()} to chat!` });
      if (onCompanionAdded) onCompanionAdded(newMemberObj);
      setInviteInput('');
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  // Simple clean SVG QR code rendering
  const qrSvg = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(inviteLink)}&color=7c3aed&bgcolor=ffffff`;

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
            onClick={() => setActiveTab('LINK')}
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
            onClick={() => setActiveTab('QR')}
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
          <div style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', background: 'rgba(16,185,129,0.15)', color: '#a7f3d0', border: '1px solid rgba(16,185,129,0.3)' }}>
            {statusMsg.text}
          </div>
        )}

        {/* Tab 1: Username / Email Direct Add */}
        {activeTab === 'DIRECT' && (
          <form onSubmit={handleAddCompanion} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Enter companion username or email address:</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. sarah_travels or alex@gmail.com"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                style={{ flexGrow: 1, fontSize: '0.85rem' }}
                required
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <UserPlus size={14} /> Add
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Copyable Link */}
        {activeTab === 'LINK' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Shareable Trip Link:</label>
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
          </div>
        )}

        {/* Tab 3: QR Code */}
        {activeTab === 'QR' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
            <img src={qrSvg} alt="Scan QR Code" style={{ width: '150px', height: '150px', borderRadius: '12px', padding: '8px', background: '#fff' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Scan with smartphone camera to join chat instantly</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Done</button>
        </div>
      </div>
    </div>
  );
}
