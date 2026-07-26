import React, { useState, useEffect } from 'react';
import { Keyboard, X, Command, Search, Moon, MessageSquare, Map, Plus } from 'lucide-react';

const SHORTCUTS = [
  { key: 'Ctrl + K', desc: 'Open Command Palette & Quick Search', icon: Search },
  { key: 'Shift + ?', desc: 'Toggle Keyboard Shortcuts Cheatsheet', icon: Keyboard },
  { key: 'Esc', desc: 'Close open modals & search windows', icon: X },
  { key: 'Ctrl + T', desc: 'Toggle Dark / Light Theme', icon: Moon },
  { key: 'Ctrl + M', desc: 'Open Group Chat Room', icon: MessageSquare },
  { key: 'Ctrl + N', desc: 'Plan a New Trip', icon: Plus },
  { key: 'Ctrl + E', desc: 'Explore Karnataka Destinations', icon: Map },
];

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          position: 'relative',
          border: '1px solid var(--primary-color)',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Keyboard size={24} style={{ color: 'var(--primary-color)' }} />
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Keyboard Shortcuts</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Fast navigation hotkeys for power users</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {SHORTCUTS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Icon size={16} style={{ color: 'var(--secondary-color)' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{s.desc}</span>
                </div>
                <kbd
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    background: 'rgba(124, 58, 237, 0.2)',
                    border: '1px solid var(--primary-color)',
                    color: '#fff',
                  }}
                >
                  {s.key}
                </kbd>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'right', paddingTop: '0.5rem' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
