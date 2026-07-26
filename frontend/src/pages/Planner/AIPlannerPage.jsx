import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import AIPlanner from './AIPlanner';
import tripService from '../../services/tripService';

export default function AIPlannerPage() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    async function loadTrips() {
      try {
        const fetched = await tripService.getAllTrips();
        setTrips(fetched);
        if (fetched && fetched.length > 0) {
          setSelectedTrip(fetched[0]);
        }
      } catch (e) {
        console.error('Failed to load trips for planner', e);
      }
    }
    loadTrips();
  }, []);

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Gemini AI Smart Travel Concierge</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Generate dynamic day-by-day travel itineraries and sync them to your trips</p>
          </div>

          {trips.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Trip:</span>
              <select
                className="form-input"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                value={selectedTrip?.id || ''}
                onChange={(e) => {
                  const t = trips.find((item) => item.id === parseInt(e.target.value));
                  setSelectedTrip(t || null);
                }}
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>{t.name || t.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <AIPlanner trip={selectedTrip} />
      </div>
    </MainLayout>
  );
}
