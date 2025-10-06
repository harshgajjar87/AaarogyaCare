import axios from '../utils/axios';

// Get all appointments for admin panel
export const getAllAdminAppointments = async () => {
  try {
    const response = await axios.get('/admin/appointments');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update appointment status (admin)
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const response = await axios.put(`/admin/appointments/${appointmentId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete appointment (admin)
export const deleteAppointment = async (appointmentId) => {
  try {
    const response = await axios.delete(`/admin/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export appointments to Excel (admin)
export const exportAppointments = async () => {
  try {
    const response = await axios.get('/admin/appointments/export', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
