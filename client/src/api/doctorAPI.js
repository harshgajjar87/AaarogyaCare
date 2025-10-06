import axios from '../utils/axios';

// Get all doctors with filters
export const getAllDoctors = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`/doctors?${params}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch doctors';
  }
};

// Get single doctor details
export const getDoctorById = async (id) => {
  try {
    const response = await axios.get(`/doctors/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch doctor details';
  }
};

// Get specializations list
export const getSpecializations = async () => {
  try {
    const response = await axios.get('/doctors/specializations');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch specializations';
  }
};

// Update doctor profile
export const updateDoctorProfile = async (profileData) => {
  try {
    const response = await axios.put('/doctors/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update profile';
  }
};

// Upload clinic images
export const uploadClinicImages = async (images) => {
  try {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('clinicImages', image);
    });
    
    const response = await axios.post('/doctors/upload-clinic-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to upload images';
  }
};
