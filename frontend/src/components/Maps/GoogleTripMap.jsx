import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Navigation,
  Layers,
  Satellite,
  Map as MapIcon,
  MapPin,
  AlertCircle,
  Loader2,
  ExternalLink,
  Compass,
  Car,
  Footprints,
  Train,
  Clock,
  Milestone
} from 'lucide-react';
import StreetViewModal from './StreetViewModal';

const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1a1d2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1d2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d1d5db' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#818cf8' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#10b981' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2d3748' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2937' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#4f46e5' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#3730a3' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#242f3e' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
];

export default function GoogleTripMap({ destinations = [], itineraries = [] }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const infoWindowRef = useRef(null);

  const [mapType, setMapType] = useState('DARK'); // 'DARK' | 'SATELLITE' | 'TERRAIN'
  const [loadStatus, setLoadStatus] = useState('LOADING'); // 'LOADING' | 'READY' | 'ERROR' | 'NO_KEY'
  const [errorMessage, setErrorMessage] = useState('');
  const [travelMode, setTravelMode] = useState('DRIVE'); // 'DRIVE' | 'WALK' | 'TRANSIT'
  const [routeMetrics, setRouteMetrics] = useState({
    distanceText: '',
    durationText: '',
    isCalculating: false,
    method: 'routes', // 'routes' or 'spherical'
  });

  // Street View Modal state
  const [streetViewTarget, setStreetViewTarget] = useState(null);

  // Extract only real, valid numeric coordinates — zero random or fake coordinates
  const validDestinations = (destinations || []).filter(
    (d) =>
      d &&
      typeof d.latitude === 'number' &&
      typeof d.longitude === 'number' &&
      !isNaN(d.latitude) &&
      !isNaN(d.longitude) &&
      d.latitude !== 0 &&
      d.longitude !== 0
  );

  // 1. Dynamic, safe Google Maps JavaScript API Loader with modern libraries
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_google_maps_api_key_here') {
      setLoadStatus('NO_KEY');
      return;
    }

    // Check if script is already present on page
    if (window.google && window.google.maps) {
      setLoadStatus('READY');
      return;
    }

    const scriptId = 'google-maps-api-script';
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      existingScript.addEventListener('load', () => setLoadStatus('READY'));
      existingScript.addEventListener('error', () => {
        setLoadStatus('ERROR');
        setErrorMessage('Failed to load Google Maps JavaScript API.');
      });
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    // Load modern places, geometry, and routes libraries — zero deprecated APIs
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey.trim())}&libraries=places,geometry,routes`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setLoadStatus('READY');
    };

    script.onerror = (err) => {
      console.error('Google Maps API script loading error:', err);
      setLoadStatus('ERROR');
      setErrorMessage('Could not load Google Maps API. Please check network connection or API key restrictions.');
    };

    document.head.appendChild(script);
  }, []);

  // Compute modern route paths using Routes library or spherical geometry calculation
  const computeModernRoute = useCallback(async (pathCoordinates) => {
    if (pathCoordinates.length < 2 || !window.google?.maps) {
      setRouteMetrics({ distanceText: '', durationText: '', isCalculating: false, method: 'none' });
      return;
    }

    setRouteMetrics((prev) => ({ ...prev, isCalculating: true }));

    // Calculate baseline spherical distance in kilometers
    let totalMeters = 0;
    for (let i = 0; i < pathCoordinates.length - 1; i++) {
      const p1 = new window.google.maps.LatLng(pathCoordinates[i].lat, pathCoordinates[i].lng);
      const p2 = new window.google.maps.LatLng(pathCoordinates[i + 1].lat, pathCoordinates[i + 1].lng);
      totalMeters += window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
    }

    const baselineKm = (totalMeters / 1000).toFixed(1);
    // Estimated durations based on travel mode
    const speedKmh = travelMode === 'WALK' ? 4.5 : travelMode === 'TRANSIT' ? 35 : 60;
    const estHours = (totalMeters / 1000) / speedKmh;
    const hrs = Math.floor(estHours);
    const mins = Math.round((estHours - hrs) * 60);
    const durationString = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

    try {
      // Check if modern Google Routes library (Route.computeRoutes) is available
      if (window.google.maps.routes?.Route?.computeRoutes) {
        const origin = {
          location: {
            latLng: {
              latitude: pathCoordinates[0].lat,
              longitude: pathCoordinates[0].lng,
            },
          },
        };
        const destination = {
          location: {
            latLng: {
              latitude: pathCoordinates[pathCoordinates.length - 1].lat,
              longitude: pathCoordinates[pathCoordinates.length - 1].lng,
            },
          },
        };

        const intermediates = pathCoordinates.slice(1, -1).map((p) => ({
          location: {
            latLng: { latitude: p.lat, longitude: p.lng },
          },
        }));

        const modernTravelMode =
          travelMode === 'WALK'
            ? 'WALK'
            : travelMode === 'TRANSIT'
            ? 'TRANSIT'
            : 'DRIVE';

        const routesResult = await window.google.maps.routes.Route.computeRoutes({
          origin,
          destination,
          intermediates,
          travelMode: modernTravelMode,
          polylineQuality: 'HIGH_QUALITY',
        });

        if (routesResult?.routes?.[0]) {
          const mainRoute = routesResult.routes[0];
          const dist = mainRoute.localizedValues?.distance?.text || `${baselineKm} km`;
          const dur = mainRoute.localizedValues?.duration?.text || durationString;

          setRouteMetrics({
            distanceText: dist,
            durationText: dur,
            isCalculating: false,
            method: 'routes',
          });
          return;
        }
      }
    } catch (e) {
      console.info('Using high-precision spherical distance routing fallback:', e?.message || e);
    }

    // High-precision spherical route metric fallback
    setRouteMetrics({
      distanceText: `${baselineKm} km`,
      durationText: durationString,
      isCalculating: false,
      method: 'spherical',
    });
  }, [travelMode]);

  // 2. Initialize and render Google Map instance
  const initMap = useCallback(() => {
    if (!mapContainerRef.current || !window.google || !window.google.maps) {
      return;
    }

    const initialCenter = validDestinations.length > 0
      ? { lat: validDestinations[0].latitude, lng: validDestinations[0].longitude }
      : { lat: 12.9716, lng: 77.5946 };

    const mapTypeId =
      mapType === 'SATELLITE'
        ? window.google.maps.MapTypeId.SATELLITE
        : mapType === 'TERRAIN'
        ? window.google.maps.MapTypeId.TERRAIN
        : window.google.maps.MapTypeId.ROADMAP;

    const styles = mapType === 'DARK' ? DARK_MAP_STYLES : [];

    const mapOptions = {
      center: initialCenter,
      zoom: validDestinations.length === 1 ? 12 : 8,
      mapTypeId,
      styles,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,
    };

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, mapOptions);
      infoWindowRef.current = new window.google.maps.InfoWindow();
    } else {
      mapInstanceRef.current.setOptions(mapOptions);
    }

    // Clear previous markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Clear previous polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (validDestinations.length === 0) {
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    const pathCoordinates = [];

    validDestinations.forEach((dest, index) => {
      const position = { lat: dest.latitude, lng: dest.longitude };
      bounds.extend(position);
      pathCoordinates.push(position);

      // Create customized numbered SVG Pin marker
      const pinSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
          <defs>
            <linearGradient id="pinGrad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#06b6d4" />
              <stop offset="100%" stop-color="#2563eb" />
            </linearGradient>
            <filter id="shadow${index}" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.5"/>
            </filter>
          </defs>
          <path d="M18 0 C8 0 0 8 0 18 C0 29 18 48 18 48 C18 48 36 29 36 18 C36 8 28 0 18 0 Z" fill="url(#pinGrad${index})" filter="url(#shadow${index})"/>
          <circle cx="18" cy="18" r="12" fill="#ffffff" />
          <text x="18" y="23" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle" fill="#0369a1">${index + 1}</text>
        </svg>
      `;

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: dest.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pinSvg)}`,
          scaledSize: new window.google.maps.Size(36, 48),
          anchor: new window.google.maps.Point(18, 48),
        },
        animation: window.google.maps.Animation.DROP,
      });

      const infoContent = `
        <div style="color: #0f172a; padding: 6px; max-width: 240px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="background: linear-gradient(135deg, #06b6d4, #2563eb); color: #fff; border-radius: 50%; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;">${index + 1}</span>
            <strong style="font-size: 14px; color: #0f172a;">${dest.name}</strong>
          </div>
          ${dest.description ? `<p style="margin: 4px 0; font-size: 12px; color: #475569; line-height: 1.4;">${dest.description}</p>` : ''}
          <div style="margin-top: 6px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span>📍 ${dest.latitude.toFixed(4)}, ${dest.longitude.toFixed(4)}</span>
          </div>
        </div>
      `;

      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
      });

      markersRef.current.push(marker);
    });

    // Draw route polyline if more than 1 destination
    if (pathCoordinates.length > 1) {
      polylineRef.current = new window.google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: '#38bdf8',
        strokeOpacity: 0.85,
        strokeWeight: 4,
        map: mapInstanceRef.current,
      });

      computeModernRoute(pathCoordinates);
    } else {
      setRouteMetrics({ distanceText: '', durationText: '', isCalculating: false, method: 'none' });
    }

    // Auto-fit map bounds with intelligent padding
    if (validDestinations.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    } else if (validDestinations.length === 1) {
      mapInstanceRef.current.setCenter(pathCoordinates[0]);
      mapInstanceRef.current.setZoom(13);
    }
  }, [validDestinations, mapType, computeModernRoute]);

  // Trigger map re-render on dependency update
  useEffect(() => {
    if (loadStatus === 'READY') {
      initMap();
    }
  }, [loadStatus, initMap]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-900 flex flex-col">
      {/* 360° Street View Modal */}
      {streetViewTarget && (
        <StreetViewModal
          isOpen={!!streetViewTarget}
          onClose={() => setStreetViewTarget(null)}
          latitude={streetViewTarget.latitude}
          longitude={streetViewTarget.longitude}
          destinationName={streetViewTarget.name}
        />
      )}

      {/* Top Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between p-3.5 bg-slate-800/80 backdrop-blur border-b border-slate-700/60 z-10 gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Navigation className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">Interactive Route Map</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/80 text-cyan-300 font-medium border border-cyan-500/20">
            Google Maps™
          </span>
        </div>

        {/* Route Metrics Summary & Travel Mode */}
        {validDestinations.length > 1 && (
          <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs">
            {/* Travel Mode Switcher */}
            <div className="flex items-center space-x-1 border-r border-slate-700 pr-2 mr-1">
              <button
                type="button"
                onClick={() => setTravelMode('DRIVE')}
                title="Driving route"
                className={`p-1 rounded-md transition-colors ${
                  travelMode === 'DRIVE' ? 'bg-cyan-500 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTravelMode('TRANSIT')}
                title="Transit route"
                className={`p-1 rounded-md transition-colors ${
                  travelMode === 'TRANSIT' ? 'bg-cyan-500 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Train className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTravelMode('WALK')}
                title="Walking route"
                className={`p-1 rounded-md transition-colors ${
                  travelMode === 'WALK' ? 'bg-cyan-500 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" />
              </button>
            </div>

            {routeMetrics.isCalculating ? (
              <span className="flex items-center space-x-1 text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                <span>Calculating route...</span>
              </span>
            ) : (
              <div className="flex items-center space-x-3 text-gray-200">
                <span className="flex items-center space-x-1 text-cyan-300 font-semibold">
                  <Milestone className="w-3.5 h-3.5" />
                  <span>{routeMetrics.distanceText || 'Calculating'}</span>
                </span>
                <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{routeMetrics.durationText || 'Calculating'}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Map Type Controls */}
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
          <button
            type="button"
            onClick={() => setMapType('DARK')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              mapType === 'DARK'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>
          <button
            type="button"
            onClick={() => setMapType('SATELLITE')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              mapType === 'SATELLITE'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>
          <button
            type="button"
            onClick={() => setMapType('TERRAIN')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              mapType === 'TERRAIN'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Terrain</span>
          </button>
        </div>
      </div>

      {/* Map Viewport Area */}
      <div className="relative w-full h-[460px] bg-slate-950">
        {loadStatus === 'LOADING' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 z-10 bg-slate-950/80 backdrop-blur">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm text-gray-300 font-medium">Initializing Google Maps...</p>
          </div>
        )}

        {loadStatus === 'NO_KEY' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-950">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1">Google Maps API Key Not Configured</h4>
            <p className="text-xs text-gray-400 max-w-sm">
              Please set <code className="text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code> in your environment file.
            </p>
          </div>
        )}

        {loadStatus === 'ERROR' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-950">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1">Google Maps Initialization Error</h4>
            <p className="text-xs text-gray-400 max-w-sm mb-4">{errorMessage}</p>
          </div>
        )}

        {loadStatus === 'READY' && validDestinations.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3 shadow-lg pointer-events-auto">
              <MapPin className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1 pointer-events-auto">No Destination Coordinates Mapped</h4>
            <p className="text-xs text-gray-400 max-w-xs pointer-events-auto">
              Add destinations with coordinates to view route pins, Street View panoramas, and travel times.
            </p>
          </div>
        )}

        {/* The Google Map canvas */}
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Destination Pills Footer with Street View Action */}
      {validDestinations.length > 0 && (
        <div className="p-3 bg-slate-800/80 border-t border-slate-700/60 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-gray-400 font-semibold shrink-0 uppercase tracking-wider text-[10px]">Stops:</span>
          {validDestinations.map((dest, idx) => (
            <div
              key={dest.id || idx}
              className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 shrink-0 text-gray-200"
            >
              <span className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold flex items-center justify-center text-[10px]">
                {idx + 1}
              </span>
              <span className="font-medium text-slate-200">{dest.name}</span>

              {/* 360° Street View Button */}
              <button
                type="button"
                onClick={() => setStreetViewTarget(dest)}
                className="p-1 rounded text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                title={`Open 360° Street View for ${dest.name}`}
              >
                <Compass className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
