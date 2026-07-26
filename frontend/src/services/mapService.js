export const mapService = {
  geocodeDestination: async (destinationName) => {
    const mocks = {
      'paris': { lat: 48.8566, lng: 2.3522, formattedAddress: 'Paris, France' },
      'london': { lat: 51.5074, lng: -0.1278, formattedAddress: 'London, United Kingdom' },
      'new york': { lat: 40.7128, lng: -74.0060, formattedAddress: 'New York, USA' },
      'tokyo': { lat: 35.6762, lng: 139.6503, formattedAddress: 'Tokyo, Japan' },
      'rome': { lat: 41.9028, lng: 12.4964, formattedAddress: 'Rome, Italy' },
    };

    const key = destinationName.toLowerCase().trim();
    if (mocks[key]) {
      return mocks[key];
    }

    return {
      lat: 40.0 + Math.random() * 10,
      lng: -70.0 - Math.random() * 10,
      formattedAddress: `${destinationName}, Earth`,
    };
  },
};

export default mapService;
