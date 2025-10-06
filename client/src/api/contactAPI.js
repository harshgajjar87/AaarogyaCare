import axios from '../utils/axios';

// Submit contact form
export const submitContactForm = async (formData) => {
  const response = await axios.post('/contact', formData);
  return response.data;
};

// Get queries for admin (if needed)
export const getQueries = async () => {
  const response = await axios.get('/admin/queries');
  return response.data;
};
