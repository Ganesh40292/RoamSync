import React, { useState } from 'react';
import { QrCode, Copy, Check, X, UserPlus, Share2 } from 'lucide-react';

export default function InviteModal({ trip, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !trip) return null;

  const inviteUrl = `${window.location.origin}/trips/${trip.id}?inviteToken=TSAI-${trip.id}-SYNC`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="glass-card" style={{ padding: '2rem', width: '90%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', textAlign: 'center' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
            <UserPlus size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem' }}>Invite Friends to {trip.name}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Scan the QR Code or share the invite link to sync travel plans live!
          </p>
        </div>

        {/* Simulated SVG QR Code */}
        <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', width: '160px', height: '160px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 100 100" width="140" height="140">
            <rect width="100" height="100" fill="#fff" />
            <path d="M10,10 h30 v30 h-30 z M15,15 h20 v20 h-20 z M20,20 h10 v10 h-10 z" fill="#000" />
            <path d="M60,10 h30 v30 h-30 z M65,15 h20 v20 h-20 z M70,20 h10 v10 h-10 z" fill="#000" />
            <path d="M10,60 h30 v30 h-30 z M15,65 h20 v20 h-20 z M20,70 h10 v10 h-10 z" fill="#000" />
            <rect x="50" y="50" width="15" height="15" fill="#7c3aed" />
            <rect x="70" y="70" width="15" height="15" fill="#06b6d4" />
            <rect x="75" y="50" width="10" height="10" fill="#000" />
            <rect x="50" y="75" width="10" height="10" fill="#000" />
          </svg>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
          <input type="text" readOnly value={inviteUrl} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.78rem', width: '100%', outline: 'none' }} />
          <button onClick={copyToClipboard} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
            {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
