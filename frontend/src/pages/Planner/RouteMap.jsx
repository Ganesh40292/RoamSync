import React from 'react';
import { MapPin } from 'lucide-react';

export default function RouteMap({ destination = 'Paris' }) {
  return (
    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem', background: 'radial-gradient(circle at center, rgba(124, 58, 237, 0.05) 0%, transparent 70%)' }}>
      <MapPin size={36} style={{ color: 'var(--primary-color)' }} />
      <div>
        <h4>Interactive Coordinates Pins Map</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Map pinned route coordinates for {destination} successfully resolved.</p>
      </div>
    </div>
  );
}
