import React from 'react';
import { CloudSun, Sun, CloudRain, Wind, Thermometer, ShieldAlert } from 'lucide-react';

export default function WeatherForecastWidget({ destinationName = 'Karnataka' }) {
  const forecastDays = [
    { day: 'Today', temp: '28°C / 20°C', condition: 'Sunny & Pleasant ☀️', uv: 'Moderate (5)', icon: Sun, color: '#f59e0b' },
    { day: 'Tomorrow', temp: '26°C / 19°C', condition: 'Passing Showers 🌧️', uv: 'Low (3)', icon: CloudRain, color: '#06b6d4' },
    { day: 'Day 3', temp: '29°C / 21°C', condition: 'Partly Cloudy ⛅', uv: 'High (7)', icon: CloudSun, color: '#7c3aed' },
  ];

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CloudSun size={20} style={{ color: 'var(--secondary-color)' }} />
          <h4 style={{ fontSize: '1rem' }}>Live Destination Weather ({destinationName})</h4>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated 15m ago</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
        {forecastDays.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div
              key={idx}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                borderLeft: `3px solid ${f.color}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{f.day}</span>
                <Icon size={18} style={{ color: f.color }} />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{f.temp}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{f.condition}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>UV Index: {f.uv}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.78rem', color: '#fcd34d' }}>
        <ShieldAlert size={14} style={{ flexShrink: 0 }} />
        <span>Travel Advisory: Carry light cottons and an umbrella for afternoon hill showers.</span>
      </div>
    </div>
  );
}
