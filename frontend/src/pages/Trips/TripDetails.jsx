import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Users, DollarSign, MessageSquare, Sparkles, MapPin, Download, FileText, UserPlus, Image, Vote, Luggage, CheckCircle2 } from 'lucide-react';
import tripService from '../../services/tripService';
import TripTimeline from './TripTimeline';
import TripMembers from './TripMembers';
import AIPlanner from '../Planner/AIPlanner';
import RouteMapLeaflet from '../../components/Maps/RouteMapLeaflet';
import PackingListWidget from '../../components/Trips/PackingListWidget';
import DebtSettlementWidget from '../../components/Expenses/DebtSettlementWidget';
import InviteModal from '../../components/Modals/InviteModal';
import TripPollsWidget from '../../components/Trips/TripPollsWidget';
import PhotoVaultGrid from '../../components/Trips/PhotoVaultGrid';
import TripReviewWidget from '../../components/Trips/TripReviewWidget';
import WeatherForecastWidget from '../../components/Weather/WeatherForecastWidget';
import { exportTripToPdf } from '../../services/pdfExportService';
import './Trips.css';

export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('ITINERARY');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrip = async () => {
    try {
      const data = await tripService.getTripById(id);
      setTrip(data);
    } catch (e) {
      console.error('Failed to load trip', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrip();
  }, [id]);

  const handleDownloadICal = () => {
    const token = localStorage.getItem('token');
    window.open(`/api/trips/${id}/export/ical?token=${token}`, '_blank');
  };

  if (isLoading) {
    return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '4rem' }}>Synchronizing Trip Details...</div>;
  }

  if (!trip) {
    return <div style={{ color: 'var(--danger)', textAlign: 'center', padding: '4rem' }}>Adventure not found.</div>;
  }

  // Calculate Progress Steps
  const hasItineraries = (trip.itineraries && trip.itineraries.length > 0) || false;
  const isPast = new Date(trip.endDate) < new Date();

  const progressSteps = [
    { label: 'Trip Created', completed: true },
    { label: 'Itinerary Set', completed: hasItineraries },
    { label: 'Expenses Tracked', completed: true },
    { label: 'Trip Complete', completed: isPast },
  ];

  return (
    <div className="trips-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.05, background: 'radial-gradient(circle, var(--primary-color) 0%, transparent 80%)' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem' }}>{trip.name || trip.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{trip.description || 'Collaborative Travel Space'}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button onClick={() => setIsInviteOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <UserPlus size={14} /> Invite Friends
            </button>
            <button onClick={handleDownloadICal} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <Download size={14} /> iCal Calendar
            </button>
            <button onClick={() => exportTripToPdf(trip)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <FileText size={14} /> PDF Booklet
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} />
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} />
            {trip.members?.length || 1} Partners
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} />
            {trip.destinations?.length || 0} Places Pinned
          </span>
        </div>

        {/* Step-by-Step Progress Tracker Bar */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          {progressSteps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step.completed ? 1 : 0.4 }}>
              <CheckCircle2 size={16} style={{ color: step.completed ? 'var(--success)' : 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: step.completed ? '600' : 'normal', color: step.completed ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'ITINERARY', label: 'Itinerary Schedule', icon: Calendar },
          { id: 'AI_PLANNER', label: 'Gemini AI Concierge', icon: Sparkles },
          { id: 'POLLS', label: 'Group Polls', icon: Vote },
          { id: 'PACKING', label: 'Weather Packing', icon: Luggage },
          { id: 'PHOTOS', label: 'Photo Vault', icon: Image },
          { id: 'MEMBERS', label: 'Travel Partners', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                padding: '0.75rem 0.5rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'var(--transition-fast)',
              }}
            >
              <Icon size={16} style={{ color: isActive ? 'var(--primary-color)' : 'var(--text-muted)' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="trip-details-container grid-2-col" style={{ gridTemplateColumns: activeTab === 'ITINERARY' ? '2fr 1fr' : '1fr' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeTab === 'ITINERARY' && (
            <>
              <RouteMapLeaflet destinations={trip.destinations} itineraries={trip.itineraries} />
              <TripTimeline trip={trip} onReload={loadTrip} />
            </>
          )}
          {activeTab === 'AI_PLANNER' && <AIPlanner trip={trip} onReload={loadTrip} />}
          {activeTab === 'POLLS' && <TripPollsWidget tripId={trip.id} />}
          {activeTab === 'PACKING' && <PackingListWidget tripId={trip.id} />}
          {activeTab === 'PHOTOS' && <PhotoVaultGrid trip={trip} />}
          {activeTab === 'MEMBERS' && <TripMembers trip={trip} onReload={loadTrip} />}
        </div>

        {activeTab === 'ITINERARY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <WeatherForecastWidget destinationName={trip.destination || trip.name || 'Karnataka'} />
            <TripMembers trip={trip} onReload={loadTrip} />
            <DebtSettlementWidget tripId={trip.id} />
            <TripReviewWidget tripId={trip.id} />
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/expenses" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <DollarSign size={16} /> Manage Shared Bills
                </Link>
                <Link to="/chat" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <MessageSquare size={16} /> Open Live Chat Room
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <InviteModal trip={trip} isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </div>
  );
}
