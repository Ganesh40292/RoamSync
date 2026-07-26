import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Camera, Bot, MessageSquare, Compass, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function FloatingDock() {
  const dockItems = [
    { label: 'Create Trip', icon: PlusCircle, path: '/trips/create', color: '#7c3aed' },
    { label: 'Expenses', icon: Camera, path: '/expenses', color: '#06b6d4' },
    { label: 'Ask AI Concierge', icon: Bot, path: '/planner', color: '#10b981' },
    { label: 'Group Chat', icon: MessageSquare, path: '/chat', color: '#ec4899' },
    { label: 'Explore Karnataka', icon: Compass, path: '/explore', color: '#f59e0b' },
  ];

  const handleOpenSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.4rem 0.8rem',
        borderRadius: '30px',
        background: 'rgba(18, 18, 24, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(124, 58, 237, 0.15)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {dockItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Link
            key={idx}
            to={item.path}
            title={item.label}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'transform 0.2s ease, background 0.2s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.15)';
              e.currentTarget.style.background = item.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <Icon size={18} />
          </Link>
        );
      })}

      <div style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />

      {/* Quick Search Shortcut */}
      <button
        onClick={handleOpenSearch}
        title="Search (Ctrl+K)"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px) scale(1.15)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
      >
        <Search size={18} />
      </button>

      {/* Theme Toggle Button */}
      <ThemeToggle />
    </div>
  );
}
