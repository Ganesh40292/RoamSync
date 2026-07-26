import axios from 'axios';

const API_URL = '/api/chat';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export const chatService = {
  getChatHistory: async (tripId) => {
    const response = await axios.get(`${API_URL}/history/${tripId}`, getHeaders());
    return response.data;
  },
};

export default chatService;
