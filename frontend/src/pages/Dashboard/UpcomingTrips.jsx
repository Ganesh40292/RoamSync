import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, User } from 'lucide-react';
import dateFormatter from '../../utils/dateFormatter';

export default function UpcomingTrips({ trips = [] }) {
  return (
    <div className="section-card glass-card">
      <div className="section-header">
        <h2>Your Travel Itineraries</h2>
        <Link to="/trips" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
          View All
        </Link>
      </div>

      <div className="trips-list">
        {trips.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
            No trips configured. Let's create your first itinerary!
            <br />
            <Link to="/trips/create" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
              Create Trip
            </Link>
          </div>
        ) : (
          trips.slice(0, 3).map((trip) => (
            <div key={trip.id} className="trip-row">
              <div className="trip-row-info">
                <span className="trip-row-title">{trip.name || trip.title || 'Untitled Adventure'}</span>
                <span className="trip-row-meta">
                  <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {dateFormatter.formatShort(trip.startDate)} - {dateFormatter.formatShort(trip.endDate)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {trip.members?.slice(0, 3).map((member, i) => (
                    <div
                      key={i}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '0.675rem',
                        border: '1px solid var(--primary-color)',
                      }}
                      title={member.username}
                    >
                      <User size={12} />
                    </div>
                  ))}
                </div>
                <Link to={`/trips/${trip.id}`} style={{ color: 'var(--primary-color)' }}>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
