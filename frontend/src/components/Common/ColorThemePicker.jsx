import React, { useState, useEffect } from 'react';

const PALETTES = [
  { name: 'Violet Cyber', primary: '#7c3aed', primaryHover: '#6d28d9', secondary: '#06b6d4', secondaryHover: '#0891b2' },
  { name: 'Neon Cyan', primary: '#06b6d4', primaryHover: '#0891b2', secondary: '#3b82f6', secondaryHover: '#2563eb' },
  { name: 'Emerald Jungle', primary: '#10b981', primaryHover: '#059669', secondary: '#f59e0b', secondaryHover: '#d97706' },
  { name: 'Sunset Gold', primary: '#f59e0b', primaryHover: '#d97706', secondary: '#ec4899', secondaryHover: '#db2777' },
  { name: 'Cosmic Pink', primary: '#ec4899', primaryHover: '#db2777', secondary: '#8b5cf6', secondaryHover: '#7c3aed' },
];

export default function ColorThemePicker() {
  const [selectedPalette, setSelectedPalette] = useState(() => {
    const saved = localStorage.getItem('colorAccent');
    return saved ? JSON.parse(saved) : PALETTES[0];
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', selectedPalette.primary);
    root.style.setProperty('--primary-hover', selectedPalette.primaryHover);
    root.style.setProperty('--secondary-color', selectedPalette.secondary);
    root.style.setProperty('--secondary-hover', selectedPalette.secondaryHover);
    localStorage.setItem('colorAccent', JSON.stringify(selectedPalette));
  }, [selectedPalette]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Custom Color Palette Accent Picker"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${selectedPalette.primary}, ${selectedPalette.secondary})`,
          border: '2px solid rgba(255,255,255,0.3)',
          cursor: 'pointer',
          boxShadow: '0 0 10px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      />

      {isOpen && (
        <div
          className="glass-card animate-scale-up"
          style={{
            position: 'absolute',
            top: '42px',
            right: 0,
            zIndex: 9999,
            padding: '1rem',
            width: '210px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          }}
        >
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Color Theme Accents
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {PALETTES.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  setSelectedPalette(p);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  border: selectedPalette.name === p.name ? '1px solid var(--primary-color)' : '1px solid transparent',
                  background: selectedPalette.name === p.name ? 'rgba(255,255,255,0.08)' : 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})`,
                    flexShrink: 0,
                  }}
                />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
