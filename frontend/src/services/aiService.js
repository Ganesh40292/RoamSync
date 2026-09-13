import axios from 'axios';

const API_URL = '/api/planner';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export const aiService = {
  generateItinerary: async (plannerRequest) => {
    const response = await axios.post(`${API_URL}/generate`, plannerRequest, getHeaders());
    return response.data;
  },

  askRoamBot: async (tripId, prompt) => {
    const response = await axios.post(`/api/trips/${tripId}/ai/chat`, { prompt }, getHeaders());
    return response.data;
  },

  getAiPackingSuggestions: async (tripId) => {
    const response = await axios.post(`/api/trips/${tripId}/packing/ai-suggest`, {}, getHeaders());
    return response.data;
  },
};

export default aiService;
