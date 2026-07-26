import React, { useState } from 'react';
import { MapPin, Navigation, Layers, Satellite, Map as MapIcon } from 'lucide-react';

export default function RouteMapLeaflet({ destinations = [], itineraries = [] }) {
  const [mapStyle, setMapStyle] = useState('DARK'); // 'DARK' | 'SATELLITE' | 'TERRAIN'

  const points = destinations.length > 0
    ? destinations.map((d) => ({ name: d.name, lat: d.latitude || 12.9716, lng: d.longitude || 77.5946 }))
    : [
        { name: 'Mysore Palace 🏰', lat: 12.3052, lng: 76.6552 },
        { name: 'Hampi Stone Chariot 🛕', lat: 15.3350, lng: 76.4600 },
        { name: 'Coorg Coffee Hills ⛰️', lat: 12.4244, lng: 75.7382 },
      ];

  const mapGradients = {
    DARK: 'radial-gradient(circle at center, #1e1b4b 0%, #0f172a 100%)',
    SATELLITE: 'radial-gradient(circle at center, #064e3b 0%, #022c22 100%)',
    TERRAIN: 'radial-gradient(circle at center, #78350f 0%, #451a03 100%)',
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Navigation size={20} style={{ color: 'var(--primary-color)' }} />
          <h4 style={{ fontSize: '1rem' }}>Interactive Route Visualizer</h4>
        </div>

        {/* Map Layer Style Switcher */}
        <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setMapStyle('DARK')}
            style={{
              background: mapStyle === 'DARK' ? 'var(--primary-color)' : 'none',
              border: 'none',
              color: '#fff',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            <Layers size={12} /> Dark
          </button>
          <button
            onClick={() => setMapStyle('SATELLITE')}
            style={{
              background: mapStyle === 'SATELLITE' ? 'var(--primary-color)' : 'none',
              border: 'none',
              color: '#fff',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            <Satellite size={12} /> Satellite
          </button>
          <button
            onClick={() => setMapStyle('TERRAIN')}
            style={{
              background: mapStyle === 'TERRAIN' ? 'var(--primary-color)' : 'none',
              border: 'none',
              color: '#fff',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            <MapIcon size={12} /> Terrain
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', height: '240px', background: mapGradients[mapStyle], borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.5s ease' }}>
        {/* SVG Route Line */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}>
          <polyline
            points="50,160 180,80 320,140 450,90"
            fill="none"
            stroke="var(--primary-color)"
            strokeWidth="3"
            strokeDasharray="6,6"
          />
        </svg>

        {/* Dynamic Pins */}
        <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 2rem' }}>
          {points.map((pt, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', boxShadow: '0 0 12px rgba(124, 58, 237, 0.6)' }}>
                {idx + 1}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#f3f4f6', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                {pt.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
