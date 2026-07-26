import React, { useState } from 'react';
import { Bell, X, Check, Trash2, DollarSign, Vote, Bot, Users } from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'Shared Expense Logged', desc: 'Sarah added $35.00 for Filter Coffee & Snacks ☕', time: '10m ago', icon: DollarSign, read: false, color: '#10b981' },
  { id: 2, title: 'AI Itinerary Generated', desc: 'Gemini AI generated a 3-day itinerary for Mysore & Hampi 🤖', time: '1h ago', icon: Bot, read: false, color: '#7c3aed' },
  { id: 3, title: 'New Group Poll Created', desc: 'Alex created a poll: "Where to have dinner in Gokarna?" 🗳️', time: '3h ago', icon: Vote, read: true, color: '#f59e0b' },
  { id: 4, title: 'Companion Joined Trip', desc: 'David joined your trip Mysore Palace Tour 🏰', time: '1d ago', icon: Users, read: true, color: '#06b6d4' },
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications Center"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '0.45rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
          position: 'relative',
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--danger)',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              borderRadius: '10px',
              padding: '0.1rem 0.35rem',
              border: '2px solid var(--dark-bg)',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div
          className="glass-card animate-scale-up"
          style={{
            position: 'absolute',
            top: '42px',
            right: 0,
            zIndex: 9999,
            width: '320px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: '1px solid var(--primary-color)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Bell size={16} style={{ color: 'var(--primary-color)' }} />
              <h4 style={{ fontSize: '0.95rem' }}>Notifications</h4>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Check size={12} /> Mark all read
            </button>
            <button onClick={clearAll} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Trash2 size={12} /> Clear all
            </button>
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '1.5rem 0' }}>
                No notifications right now!
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => toggleRead(n.id)}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(124, 58, 237, 0.1)',
                      borderLeft: `3px solid ${n.color}`,
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '0.6rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Icon size={16} style={{ color: n.color, marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: n.read ? 'normal' : 'bold', color: 'var(--text-primary)' }}>{n.title}</span>
                      <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{n.desc}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>{n.time}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
