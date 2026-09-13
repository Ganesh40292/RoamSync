import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';

export default function PlaceAutocompleteInput({
  onSelectPlace,
  placeholder = 'Search places, landmarks, or hotels with Google Places...',
  className = '',
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedName, setSelectedName] = useState('');

  const containerRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const dummyDivRef = useRef(null);

  // Initialize Places services when Google Maps is ready
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }

    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
    if (!placesServiceRef.current && dummyDivRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDivRef.current);
    }
  }, []);

  // Debounced autocomplete query
  useEffect(() => {
    if (!query.trim() || query.length < 2 || selectedName === query) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      if (!autocompleteServiceRef.current && window.google?.maps?.places) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      }

      if (!autocompleteServiceRef.current) return;

      setIsLoading(true);
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: query,
        },
        (predictions, status) => {
          setIsLoading(false);
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            Array.isArray(predictions)
          ) {
            setSuggestions(predictions);
            setIsOpen(true);
          } else {
            setSuggestions([]);
            setIsOpen(false);
          }
        }
      );
    }, 280);

    return () => clearTimeout(timer);
  }, [query, selectedName]);

  // Click outside listener to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle user selecting a place prediction
  const handleSelectPrediction = (prediction) => {
    const placeId = prediction.place_id;
    const mainText = prediction.structured_formatting?.main_text || prediction.description;
    setQuery(mainText);
    setSelectedName(mainText);
    setIsOpen(false);
    setSuggestions([]);

    if (!placesServiceRef.current && dummyDivRef.current && window.google?.maps?.places) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDivRef.current);
    }

    if (!placesServiceRef.current) {
      console.warn('PlacesService not yet initialized');
      return;
    }

    setIsLoading(true);
    // Request strictly the essential fields needed by RoamSync
    placesServiceRef.current.getDetails(
      {
        placeId,
        fields: ['place_id', 'name', 'formatted_address', 'geometry'],
      },
      (place, status) => {
        setIsLoading(false);
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry &&
          place.geometry.location
        ) {
          const minimalPlace = {
            placeId: place.place_id,
            displayName: place.name || mainText,
            formattedAddress: place.formatted_address || prediction.description,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          };

          if (onSelectPlace) {
            onSelectPlace(minimalPlace);
          }
        }
      }
    );
  };

  const handleClear = () => {
    setQuery('');
    setSelectedName('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Hidden div required by Google PlacesService for PlacesService constructor */}
      <div ref={dummyDivRef} style={{ display: 'none' }} />

      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-0.5 text-gray-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Predictions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-[#0f172a] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-800">
          {suggestions.map((item) => (
            <button
              key={item.place_id}
              type="button"
              onClick={() => handleSelectPrediction(item)}
              className="w-full px-4 py-3 text-left hover:bg-slate-800/70 flex items-start space-x-3 transition-colors group"
            >
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 mt-0.5 shrink-0 transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {item.structured_formatting?.main_text || item.description}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {item.structured_formatting?.secondary_text || item.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
