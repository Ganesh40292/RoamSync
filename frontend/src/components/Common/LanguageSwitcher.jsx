import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  { code: 'hi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('appLang') || 'en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('appLang', currentLang);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: currentLang }));
  }, [currentLang]);

  const activeLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Change Language"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.35rem 0.6rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-primary)',
          fontSize: '0.78rem',
        }}
      >
        <Globe size={14} style={{ color: 'var(--secondary-color)' }} />
        <span>{activeLangObj.flag} {activeLangObj.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div
          className="glass-card animate-scale-up"
          style={{
            position: 'absolute',
            top: '38px',
            right: 0,
            zIndex: 9999,
            padding: '0.5rem',
            width: '160px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem',
            boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
          }}
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setCurrentLang(l.code);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: 'none',
                background: currentLang === l.code ? 'rgba(124,58,237,0.2)' : 'transparent',
                color: currentLang === l.code ? 'var(--primary-color)' : 'var(--text-primary)',
                fontWeight: currentLang === l.code ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: '0.8rem',
                textAlign: 'left',
              }}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
