import axios from 'axios';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export const mapService = {
  /**
   * Geocodes a destination via Spring Boot proxy backed by OpenStreetMap Nominatim.
   * Architecture: React -> Spring Boot (/api/geocode) -> OpenStreetMap Nominatim.
   * Open-Meteo is strictly reserved for weather.
   */
  geocodeDestination: async (destinationName) => {
    if (!destinationName || !destinationName.trim()) {
      return { lat: 48.8566, lng: 2.3522, formattedAddress: 'Paris, France' };
    }

    try {
      const response = await axios.get(
        `/api/geocode?query=${encodeURIComponent(destinationName.trim())}`,
        getHeaders()
      );
      if (response.data && response.data.found && response.data.lat && response.data.lng) {
        return {
          lat: response.data.lat,
          lng: response.data.lng,
          formattedAddress: response.data.formattedAddress,
        };
      }
    } catch (e) {
      console.warn('Geocoding service lookup failed:', e);
    }

    // Default fallback if location not found
    return {
      lat: 48.8566,
      lng: 2.3522,
      formattedAddress: destinationName,
    };
  },
};

export default mapService;
