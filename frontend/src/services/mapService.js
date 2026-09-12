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
  geocodeDestination: async (destinationName) => {
    if (!destinationName || !destinationName.trim()) {
      return { lat: 48.8566, lng: 2.3522, formattedAddress: 'Paris, France' };
    }

    try {
      const response = await axios.get(`/api/geocode?query=${encodeURIComponent(destinationName.trim())}`, getHeaders());
      if (response.data && response.data.found && response.data.lat && response.data.lng) {
        return {
          lat: response.data.lat,
          lng: response.data.lng,
          formattedAddress: response.data.formattedAddress,
        };
      }
    } catch (e) {
      console.warn('Backend geocoding proxy failed, trying direct lookup', e);
    }

    // Direct client fallback to Open-Meteo Geocoding
    try {
      const directRes = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destinationName.trim())}&count=1&language=en&format=json`
      );
      if (directRes.data?.results?.length > 0) {
        const item = directRes.data.results[0];
        return {
          lat: item.latitude,
          lng: item.longitude,
          formattedAddress: `${item.name}${item.country ? ', ' + item.country : ''}`,
        };
      }
    } catch (err) {
      console.error('Direct geocoding lookup failed', err);
    }

    // Default return without random noise
    return {
      lat: 48.8566,
      lng: 2.3522,
      formattedAddress: destinationName,
    };
  },
};

export default mapService;
