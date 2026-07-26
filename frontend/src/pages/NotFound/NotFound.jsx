import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--dark-bg)', padding: '1.5rem' }}>
      <div className="glass-card animate-slide-up" style={{ padding: '3rem', maxWidth: '440px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
        <HelpCircle size={48} style={{ color: 'var(--text-muted)' }} />
        <h1 style={{ fontSize: '2rem' }}>404 - Lost in Travel</h1>
        <p style={{ color: 'var(--text-secondary)' }}>The page you are looking for has been relocated or doesn't exist.</p>
        <Link to="/" className="btn-primary" style={{ width: '100%' }}>Return Home</Link>
      </div>
    </div>
  );
}
