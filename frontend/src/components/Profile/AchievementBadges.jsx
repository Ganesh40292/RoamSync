import React from 'react';
import { Award, ShieldCheck, Zap, Compass, DollarSign, HeartHandshake } from 'lucide-react';

const BADGES = [
  { id: 'first_trip', title: 'First Adventure 🗺️', desc: 'Planned your first trip itinerary', icon: Compass, unlocked: true, color: '#7c3aed' },
  { id: 'budget_master', title: 'Budget Master 💰', desc: 'Logged shared trip expenses', icon: DollarSign, unlocked: true, color: '#10b981' },
  { id: 'ai_explorer', title: 'AI Explorer 🤖', desc: 'Generated itinerary with Gemini AI', icon: Zap, unlocked: true, color: '#06b6d4' },
  { id: 'social_butterfly', title: 'Social Companion 💬', desc: 'Invited companions to group chat', icon: HeartHandshake, unlocked: true, color: '#ec4899' },
  { id: 'karnataka_pro', title: 'Karnataka Scout 🟡🔴', desc: 'Explored heritage & coastal destinations', icon: Award, unlocked: true, color: '#f59e0b' },
  { id: 'globe_trotter', title: 'Globe Trotter 🌍', desc: 'Planned 5+ multi-day journeys', icon: ShieldCheck, unlocked: false, color: '#6b7280' },
];

export default function AchievementBadges() {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Award style={{ color: 'var(--primary-color)' }} size={20} />
        Travel Achievements & Badges
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {BADGES.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.id}
              style={{
                background: b.unlocked ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.2)',
                border: `1px solid ${b.unlocked ? b.color : 'var(--border-color)'}`,
                borderRadius: '10px',
                padding: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                opacity: b.unlocked ? 1 : 0.5,
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: `${b.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: b.color,
                  flexShrink: 0,
                }}
              >
                <Icon size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{b.title}</span>
                <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>{b.desc}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
