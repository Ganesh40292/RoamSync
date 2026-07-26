import axios from 'axios';

const API_URL = '/api/expenses';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export const expenseService = {
  getExpensesByTrip: async (tripId) => {
    const response = await axios.get(`${API_URL}/trip/${tripId}`, getHeaders());
    return response.data;
  },

  createExpense: async (expenseData) => {
    const response = await axios.post(API_URL, expenseData, getHeaders());
    return response.data;
  },

  getNetBalances: async (tripId) => {
    const response = await axios.get(`${API_URL}/trip/${tripId}/balances`, getHeaders());
    return response.data;
  },
};

export default expenseService;
