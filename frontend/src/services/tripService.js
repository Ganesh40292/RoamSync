import axios from 'axios';

const API_URL = '/api/trips';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export const tripService = {
  getAllTrips: async () => {
    const response = await axios.get(API_URL, getHeaders());
    return response.data;
  },

  getTripById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getHeaders());
    return response.data;
  },

  createTrip: async (tripData) => {
    const response = await axios.post(API_URL, tripData, getHeaders());
    return response.data;
  },

  inviteMember: async (tripId, username) => {
    const response = await axios.post(`${API_URL}/${tripId}/invite?username=${username}`, {}, getHeaders());
    return response.data;
  },

  addItinerary: async (tripId, itineraryData) => {
    const response = await axios.post(`${API_URL}/${tripId}/itinerary`, itineraryData, getHeaders());
    return response.data;
  },
};

export default tripService;
