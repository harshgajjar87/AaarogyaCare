import axios from '../utils/axios';

// Get revenue settings
export const getRevenueSettings = async () => {
  const response = await axios.get('/revenue/settings');
  return response.data;
};

// Update revenue settings
export const updateRevenueSettings = async (settings) => {
  const response = await axios.put('/revenue/settings', settings);
  return response.data;
};

// Get revenue analytics
export const getRevenueAnalytics = async (period = 'month') => {
  const response = await axios.get(`/revenue/analytics?period=${period}`);
  return response.data;
};

// Get all transactions
export const getTransactions = async (params = {}) => {
  const { page = 1, limit = 20, status, payoutStatus, doctorId } = params;
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...(status && { status }),
    ...(payoutStatus && { payoutStatus }),
    ...(doctorId && { doctorId })
  });
  
  const response = await axios.get(`/revenue/transactions?${queryParams}`);
  return response.data;
};

// Mark payout as completed
export const completePayout = async (transactionId, payoutData) => {
  const response = await axios.put(`/revenue/payout/${transactionId}`, payoutData);
  return response.data;
};

// Get doctor earnings (for doctor dashboard)
export const getDoctorEarnings = async () => {
  const response = await axios.get('/revenue/doctor-earnings');
  return response.data;
};
