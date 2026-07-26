import React from 'react';

export default function DayCard({ dayNumber, activities = [] }) {
  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <h5 style={{ color: 'var(--secondary-color)', marginBottom: '0.75rem' }}>Day {dayNumber} Schedule</h5>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {activities.map((act, index) => (
          <div key={index} style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', borderLeft: '3px solid var(--primary-color)', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem' }}>{act.activity}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📍 {act.venue}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🕒 {act.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
