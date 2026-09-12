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

  updateTrip: async (id, tripData) => {
    const response = await axios.put(`${API_URL}/${id}`, tripData, getHeaders());
    return response.data;
  },

  deleteTrip: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
    return response.data;
  },

  createInvitation: async (tripId, recipientEmail = null) => {
    const response = await axios.post(`${API_URL}/${tripId}/invitations`, { recipientEmail }, getHeaders());
    return response.data;
  },

  addMember: async (tripId, username) => {
    const response = await axios.post(`${API_URL}/${tripId}/members?username=${encodeURIComponent(username)}`, {}, getHeaders());
    return response.data;
  },

  removeMember: async (tripId, username) => {
    const response = await axios.delete(`${API_URL}/${tripId}/members?username=${encodeURIComponent(username)}`, getHeaders());
    return response.data;
  },

  transferOwnership: async (tripId, targetUserId) => {
    const response = await axios.put(`${API_URL}/${tripId}/owner/transfer?targetUserId=${targetUserId}`, {}, getHeaders());
    return response.data;
  },

  addItinerary: async (tripId, itineraryData) => {
    const response = await axios.post(`${API_URL}/${tripId}/itineraries`, itineraryData, getHeaders());
    return response.data;
  },
};

export default tripService;
