import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Map, DollarSign, MessageSquare, Compass, Brain, User, X } from 'lucide-react';

const COMMANDS = [
  { label: 'Dashboard', desc: 'Go to home dashboard', path: '/', icon: Compass },
  { label: 'My Trips', desc: 'View all your adventures', path: '/trips', icon: Map },
  { label: 'Create New Trip', desc: 'Plan a new trip', path: '/trips/create', icon: Map },
  { label: 'Expenses', desc: 'Open expense ledger', path: '/expenses', icon: DollarSign },
  { label: 'Group Chat', desc: 'Open chat room', path: '/chat', icon: MessageSquare },
  { label: 'Explore Karnataka', desc: 'Browse destinations', path: '/explore', icon: Compass },
  { label: 'AI Smart Planner', desc: 'Generate AI itinerary', path: '/planner', icon: Brain },
  { label: 'Profile Settings', desc: 'Edit your profile', path: '/profile', icon: User },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filtered = COMMANDS.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={() => setIsOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        zIndex: 9998,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--card-bg, #1e1b4b)',
          border: '1px solid var(--primary-color)',
          borderRadius: '14px',
          boxShadow: '0 24px 80px rgba(124,58,237,0.3)',
          overflow: 'hidden',
          animation: 'scaleUp 0.15s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <Search size={18} style={{ color: 'var(--primary-color)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, actions, features..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', flexGrow: 1 }}
          />
          <kbd style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>ESC</kbd>
        </div>

        <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '0.5rem' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No matching results</div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.path}
                  onClick={() => handleSelect(cmd.path)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.75rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'background 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124,58,237,0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <Icon size={18} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{cmd.label}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cmd.desc}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Ctrl+K Toggle</span>
        </div>
      </div>
    </div>
  );
}
