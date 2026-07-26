import React from 'react';
import AIPlanner from './AIPlanner';

export default function ItineraryBuilder({ trip, onReload }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3>AI Smart Itinerary Builder</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Construct dynamic coordinates plans using artificial intelligence models.</p>
      </div>
      <AIPlanner trip={trip} onReload={onReload} />
    </div>
  );
}
