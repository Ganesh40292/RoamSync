import axios from 'axios';

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
    const response = await axios.get(`/api/trips/${tripId}/expenses`, getHeaders());
    return response.data;
  },

  createExpense: async (expenseData) => {
    const tripId = expenseData.tripId;
    const response = await axios.post(`/api/trips/${tripId}/expenses`, expenseData, getHeaders());
    return response.data;
  },

  getBalances: async (tripId) => {
    const response = await axios.get(`/api/trips/${tripId}/expenses/balances`, getHeaders());
    return response.data;
  },

  getNetBalances: async (tripId) => {
    const response = await axios.get(`/api/trips/${tripId}/expenses/balances`, getHeaders());
    return response.data;
  },

  getSettlements: async (tripId) => {
    const response = await axios.get(`/api/trips/${tripId}/expenses/settlements`, getHeaders());
    return response.data;
  },

  settleSettlement: async (tripId, settlementId) => {
    const response = await axios.post(`/api/trips/${tripId}/expenses/settlements/${settlementId}/settle`, {}, getHeaders());
    return response.data;
  },

  scanReceipt: async (tripId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    const response = await axios.post(`/api/trips/${tripId}/expenses/ocr`, formData, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default expenseService;
