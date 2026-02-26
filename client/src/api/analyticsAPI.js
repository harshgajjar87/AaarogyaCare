import axios from '../utils/axios';

export const getDoctorAnalytics = async () => {
  const response = await axios.get('/analytics/doctor');
  return response.data;
};

export const getAdminAnalytics = async () => {
  const response = await axios.get('/analytics/admin');
  return response.data;
};
