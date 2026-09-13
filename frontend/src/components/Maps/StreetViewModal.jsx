import React, { useEffect, useRef, useState } from 'react';
import { X, Compass, ExternalLink, AlertCircle } from 'lucide-react';

export default function StreetViewModal({
  isOpen,
  onClose,
  latitude,
  longitude,
  destinationName = 'Destination',
}) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('LOADING'); // 'LOADING' | 'AVAILABLE' | 'UNAVAILABLE' | 'ERROR'

  useEffect(() => {
    if (!isOpen || !latitude || !longitude || !window.google || !window.google.maps) {
      return;
    }

    setStatus('LOADING');
    const location = { lat: Number(latitude), lng: Number(longitude) };
    const streetViewService = new window.google.maps.StreetViewService();

    // Check for Street View panorama coverage within a 100-meter radius
    streetViewService.getPanorama(
      {
        location,
        radius: 100,
        source: window.google.maps.StreetViewSource.OUTDOOR,
      },
      (data, svStatus) => {
        if (svStatus === window.google.maps.StreetViewStatus.OK && data && data.location) {
          setStatus('AVAILABLE');
          if (containerRef.current) {
            new window.google.maps.StreetViewPanorama(containerRef.current, {
              position: data.location.latLng,
              pov: { heading: 165, pitch: 0 },
              zoom: 1,
              addressControl: true,
              showRoadLabels: true,
              motionTracking: false,
              motionTrackingControl: false,
            });
          }
        } else {
          setStatus('UNAVAILABLE');
        }
      }
    );
  }, [isOpen, latitude, longitude]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="streetview-title"
    >
      <div className="relative w-full max-w-4xl bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1e293b]/70 backdrop-blur">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 id="streetview-title" className="text-base font-bold text-white flex items-center space-x-2">
                <span>360° Street View</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {destinationName}
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Lat: {Number(latitude).toFixed(4)}, Lng: {Number(longitude).toFixed(4)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-colors"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Street View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Panorama Canvas / State Viewports */}
        <div className="relative flex-1 w-full h-[520px] bg-[#090d16]">
          {status === 'LOADING' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 z-10 bg-[#090d16]/80 backdrop-blur">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-300 font-medium">Connecting to Street View...</p>
            </div>
          )}

          {status === 'UNAVAILABLE' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-amber-400" />
              </div>
              <h4 className="text-base font-semibold text-white mb-1">No Street View Coverage Available</h4>
              <p className="text-xs text-gray-400 max-w-md mb-6 leading-relaxed">
                Google Street View imagery is not available within 100 meters of this location. You can view standard satellite imagery or explore the surrounding area on Google Maps.
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-semibold hover:brightness-110 shadow-lg shadow-blue-500/20 transition-all"
              >
                <span>Explore Coordinates on Google Maps</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          <div ref={containerRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
