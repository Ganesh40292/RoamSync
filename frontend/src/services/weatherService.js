import axios from 'axios';

const API_URL = '/api/weather';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export const weatherService = {
  getWeather: async (lat, lon) => {
    const response = await axios.get(`${API_URL}?lat=${lat}&lon=${lon}`, getHeaders());
    return response.data;
  },
};

export default weatherService;
