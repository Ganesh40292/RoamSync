import React from 'react';
import { X, Sparkles, MapPin, Calendar, DollarSign, Award, Trophy, Compass, Share2 } from 'lucide-react';

export default function TripWrappedModal({ trip, isOpen, onClose }) {
  if (!isOpen || !trip) return null;

  const destinations = trip.destinations || [];
  const itineraries = trip.itineraries || [];
  const members = trip.members || [];
  const totalBudget = trip.budget || 2500;

  // 1. Calculate planned route distance (in km) between sequential destinations
  let totalRouteKm = 0;
  for (let i = 0; i < destinations.length - 1; i++) {
    const d1 = destinations[i];
    const d2 = destinations[i + 1];
    if (d1.latitude && d1.longitude && d2.latitude && d2.longitude) {
      totalRouteKm += calculateHaversineKm(d1.latitude, d1.longitude, d2.latitude, d2.longitude);
    }
  }

  // 2. Compute trip duration
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const durationDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

  // 3. Transparent member achievement highlights
  const memberCount = Math.max(1, members.length);
  const itineraryCount = itineraries.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#030712] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-white text-center">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Ribbon */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RoamMate Trip Wrapped</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-teal-200 to-purple-400">
            {trip.name || trip.title}
          </h2>
          <p className="text-xs text-gray-400">
            {durationDays} Days of Adventure • {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
          </p>
        </div>

        {/* Stat Metric Tiles */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {/* Tile 1: Route Distance */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur flex flex-col gap-1">
            <div className="flex items-center justify-between text-cyan-400">
              <Compass className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold text-gray-400">Route</span>
            </div>
            <span className="text-2xl font-black text-white mt-1">
              {totalRouteKm > 0 ? `${Math.round(totalRouteKm)} km` : 'Multi-stop'}
            </span>
            <span className="text-[11px] text-gray-400">Planned itinerary transit</span>
          </div>

          {/* Tile 2: Places Pinned */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur flex flex-col gap-1">
            <div className="flex items-center justify-between text-emerald-400">
              <MapPin className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold text-gray-400">Stops</span>
            </div>
            <span className="text-2xl font-black text-white mt-1">{destinations.length}</span>
            <span className="text-[11px] text-gray-400">Destinations pinned</span>
          </div>

          {/* Tile 3: Schedule Items */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur flex flex-col gap-1">
            <div className="flex items-center justify-between text-purple-400">
              <Calendar className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold text-gray-400">Activities</span>
            </div>
            <span className="text-2xl font-black text-white mt-1">{itineraryCount}</span>
            <span className="text-[11px] text-gray-400">Timeline events</span>
          </div>

          {/* Tile 4: Travel Crew */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur flex flex-col gap-1">
            <div className="flex items-center justify-between text-amber-400">
              <Trophy className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold text-gray-400">Crew</span>
            </div>
            <span className="text-2xl font-black text-white mt-1">{memberCount}</span>
            <span className="text-[11px] text-gray-400">Companions synced</span>
          </div>
        </div>

        {/* Member Achievements Podium */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-slate-900/40 to-cyan-900/30 border border-purple-500/20 text-left flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-purple-200">Trip MVP & Badges</div>
            <p className="text-xs text-gray-300 truncate">
              Lead Organizer: <span className="font-semibold text-white">@{trip.owner?.username || 'Owner'}</span>
            </p>
            <p className="text-[11px] text-gray-400">
              {destinations.length >= 3 ? '🗺️ Master Pathfinder' : '🎒 Explorer Squad'} • {itineraries.length > 5 ? '⚡ High Activity Pace' : '🌴 Balanced Leisure'}
            </p>
          </div>
        </div>

        {/* Share & Dismiss Actions */}
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(
                  `🎉 Check out our trip "${trip.name}" on RoamMate! ${destinations.length} places mapped, ${itineraryCount} scheduled activities.`
                );
                alert('Trip summary copied to clipboard!');
              }
            }}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Trip Recap</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Great-circle distance calculation
function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
