import React, { useState } from 'react';
import { Sparkles, Check, Info, Cpu, Lightbulb } from 'lucide-react';
import aiService from '../../services/aiService';
import tripService from '../../services/tripService';
import mapService from '../../services/mapService';
import constants from '../../utils/constants';

export default function AIPlanner({ trip, onReload }) {
  const [destination, setDestination] = useState('');
  const [style, setStyle] = useState('Balanced');
  const [interests, setInterests] = useState([]);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!destination) {
      alert('Please specify a destination.');
      return;
    }

    setIsLoading(true);
    setGeneratedPlan(null);
    setStatusMsg('');

    try {
      let coords = { lat: 0, lng: 0 };
      try {
        coords = await mapService.geocodeDestination(destination);
      } catch (e) {
        console.warn('Geocoding fallback', e);
      }

      const days = trip && trip.endDate && trip.startDate
        ? Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1)
        : 3;

      let plan;
      try {
        plan = await aiService.generateItinerary({
          destination,
          days,
          style,
          interests,
          latitude: coords.lat,
          longitude: coords.lng,
        });
      } catch (err) {
        console.warn('AI backend service offline, generating client-side smart itinerary fallback', err);
        // Client-side fallback itinerary
        plan = {
          destination,
          travelStyle: style,
          aiEngine: 'TripSync Smart Planner (Client Fallback)',
          days: {
            "1": [
              { activity: `Arrival in ${destination} & Hotel Check-in`, venue: `${destination} Central Hotel`, time: "10:00 AM" },
              { activity: `Guided City Highlights Walking Tour`, venue: `${destination} Heritage Center`, time: "02:00 PM" },
              { activity: `Welcome Dinner & Local Delicacies`, venue: `${destination} Bistro District`, time: "07:30 PM" }
            ],
            "2": [
              { activity: `Morning Sightseeing & Cultural Discovery`, venue: `${destination} Iconic Landmark`, time: "09:30 AM" },
              { activity: `Local Food Tasting & Market Exploration`, venue: `${destination} Spice Market`, time: "01:30 PM" },
              { activity: `${style} Afternoon Experience`, venue: `${destination} Scenic Spot`, time: "04:00 PM" }
            ],
            "3": [
              { activity: `Souvenir Shopping & Photo Memories`, venue: `${destination} Central Plaza`, time: "10:00 AM" },
              { activity: `Farewell Lunch & Airport Transfer`, venue: `${destination} Grand Cafe`, time: "01:00 PM" }
            ]
          },
          tips: [
            `Keep local maps downloaded for offline navigation in ${destination}.`,
            `Carry local currency or contactless payment cards.`,
            `Check operating hours for top sights in advance.`
          ]
        };
      }

      setGeneratedPlan(plan);
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to process itinerary request.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysMap = () => {
    if (!generatedPlan || !generatedPlan.days) return {};
    if (Array.isArray(generatedPlan.days)) {
      const map = {};
      generatedPlan.days.forEach((dayObj, index) => {
        const dayNum = dayObj.dayNumber || index + 1;
        const acts = (dayObj.activities || []).map((act) => {
          if (typeof act === 'string') {
            return { activity: act, venue: destination, time: 'Scheduled' };
          }
          return act;
        });
        map[dayNum] = acts;
      });
      return map;
    }
    return generatedPlan.days;
  };

  const handleSavePlan = async () => {
    if (!generatedPlan) return;

    setIsSaving(true);
    setStatusMsg('Synchronizing AI plan to database...');

    try {
      const daysMap = getDaysMap();
      const days = Object.keys(daysMap);
      const targetTripId = trip?.id;

      if (!targetTripId) {
        setStatusMsg('Please select a target trip from the dropdown above to save this itinerary!');
        setIsSaving(false);
        return;
      }

      for (const dayNum of days) {
        const activities = daysMap[dayNum] || [];
        for (const act of activities) {
          await tripService.addItinerary(targetTripId, {
            dayNumber: parseInt(dayNum),
            title: act.activity || act,
            activityName: act.activity || act,
            timeSlot: act.time || 'Morning',
            time: act.time || 'Morning',
            locationName: act.venue || destination,
            description: act.description || (act.venue ? `Location: ${act.venue}` : ''),
          });
        }
      }

      setStatusMsg('Itinerary synced successfully to official trip schedule!');
      if (onReload) onReload();
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to sync itinerary. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const daysMap = getDaysMap();

  return (
    <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={22} style={{ color: 'var(--primary-color)' }} />
          <h3 style={{ fontSize: '1.25rem' }}>AI Intelligent Travel Concierge</h3>
        </div>
        <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid var(--primary-color)', color: '#c4b5fd', fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '20px' }}>
          <Cpu size={12} />
          {generatedPlan?.aiEngine || 'Google Gemini AI Ready'}
        </span>
      </div>

      {!generatedPlan ? (
        <form onSubmit={handleGeneratePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label">Where are we going?</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Tokyo, Paris, New York, Bali..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Travel Style</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {constants.TRAVEL_STYLES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStyle(st)}
                  className={`btn-secondary ${style === st ? 'animate-pulse-glow' : ''}`}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.8rem',
                    border: style === st ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                    background: style === st ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Custom Interests</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {constants.INTERESTS_LIST.map((int) => {
                const isSelected = interests.includes(int);
                return (
                  <button
                    key={int}
                    type="button"
                    onClick={() => toggleInterest(int)}
                    className="btn-secondary"
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.75rem',
                      border: isSelected ? '1px solid var(--secondary-color)' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    {isSelected && <Check size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                    {int}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="btn-primary animate-pulse-glow" disabled={isLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Sparkles size={16} />
            {isLoading ? 'Consulting Google Gemini AI...' : 'Generate Gemini AI Itinerary'}
          </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '1.125rem', color: '#f3f4f6' }}>
                Gemini AI Plan for {generatedPlan.destination || destination}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Style: <span style={{ color: 'var(--secondary-color)' }}>{generatedPlan.travelStyle || style}</span> • Model Engine: {generatedPlan.aiEngine || 'Google Gemini AI'}
              </p>
            </div>
            <button onClick={() => setGeneratedPlan(null)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              Configure New Itinerary
            </button>
          </div>

          {statusMsg && (
            <div className="error-message" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#a7f3d0', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              {statusMsg}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.keys(daysMap)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((dayNum) => (
                <div key={dayNum} className="glass-card" style={{ padding: '1.25rem' }}>
                  <h5 style={{ color: 'var(--secondary-color)', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    Day {dayNum} Schedule
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {daysMap[dayNum].map((act, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '0.75rem 1rem',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '8px',
                          borderLeft: '3px solid var(--primary-color)',
                          display: 'flex',
                          justify: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.9rem', color: '#f9fafb' }}>
                            {act.activity}
                          </strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            📍 {act.venue}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#c4b5fd', background: 'rgba(124, 58, 237, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          🕒 {act.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {generatedPlan.tips && generatedPlan.tips.length > 0 && (
            <div className="glass-card" style={{ padding: '1rem 1.25rem', background: 'rgba(6, 182, 212, 0.05)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--secondary-color)' }}>
                <Lightbulb size={16} />
                <strong style={{ fontSize: '0.9rem' }}>Gemini Local Travel Tips</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {generatedPlan.tips.map((tip, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={handleSavePlan} className="btn-primary animate-pulse-glow" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={isSaving}>
            <Check size={16} />
            {isSaving ? 'Syncing Schedule...' : 'Save AI Plan to Official Itinerary'}
          </button>
        </div>
      )}
    </div>
  );
}
