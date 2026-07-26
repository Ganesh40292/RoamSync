import React from 'react';
import { Shield, Server, Activity, Users } from 'lucide-react';

export default function AdminDashboard() {
  const metrics = [
    { label: 'System CPU', value: '14%', icon: Server, color: 'var(--primary-color)' },
    { label: 'RAM Utilization', value: '1.2 GB / 4.0 GB', icon: Activity, color: 'var(--secondary-color)' },
    { label: 'Active Socket Workers', value: '8 workers', icon: Users, color: 'var(--success)' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <Shield size={22} style={{ color: 'var(--primary-color)' }} />
        <h2>Administrative Console Panel</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {metrics.map((met, idx) => {
          const Icon = met.icon;
          return (
            <div key={idx} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: met.color }}>
                <Icon size={24} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{met.value}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{met.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3>Console Utilities</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Perform active cleanups and analyze Spring Boot websocket health metrics.</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" style={{ background: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem 1.5rem' }} onClick={() => alert('Simulated system cleanups executed!')}>
            Flush Inactive Travel Sessions
          </button>
          <button className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }} onClick={() => alert('Simulated system configurations downloaded!')}>
            Export Application Logs
          </button>
        </div>
      </div>
    </div>
  );
}
