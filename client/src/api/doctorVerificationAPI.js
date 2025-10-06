import axios from '../utils/axios';

export const submitDoctorVerification = async (formData) => {
  const response = await axios.post('/verification/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getVerificationStatus = async () => {
  const response = await axios.get('/verification/status');
  return response.data;
};

export const getPendingVerifications = async () => {
  const response = await axios.get('/verification/pending');
  return response.data;
};

export const approveVerification = async (id, adminNotes) => {
  const response = await axios.put(`/verification/approve/${id}`, { adminNotes });
  return response.data;
};

export const rejectVerification = async (id, adminNotes) => {
  const response = await axios.put(`/verification/reject/${id}`, { adminNotes });
  return response.data;
};

export const getVerificationDetails = async (id) => {
  const response = await axios.get(`/verification/${id}`);
  return response.data;
};
