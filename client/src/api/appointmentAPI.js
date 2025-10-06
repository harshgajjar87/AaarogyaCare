import axios from '../utils/axios';

// Create a new appointment
export const createAppointment = async (appointmentData) => {
  try {
    const response = await axios.post('/appointments', appointmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get appointments by patient ID
export const getAppointmentsByPatientId = async (patientId) => {
  try {
    const response = await axios.get(`/appointments/patient/${patientId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const exportDoctorAppointments = async () => {
  try {
    const response = await axios.get('/appointments/export', {
      responseType: 'blob', // Important for handling binary data
    });
    // Create a URL for the blob and trigger a download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'appointments.xlsx'); // Specify the file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    throw error;
  }
};

// Get doctor appointments
export const getDoctorAppointments = async () => {
  try {
    const response = await axios.get('/appointments/doctor');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get doctor pending appointments
export const getDoctorPendingAppointments = async () => {
  try {
    const response = await axios.get('/appointments/doctor/pending');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Approve an appointment
export const approveAppointment = async (appointmentId) => {
  try {
    const response = await axios.put(`/appointments/approve/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reject an appointment
export const rejectAppointment = async (appointmentId) => {
  try {
    const response = await axios.put(`/appointments/reject/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all appointments
export const getAllAppointments = async () => {
  try {
    const response = await axios.get('/appointments/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get doctor patients
export const getDoctorPatients = async () => {
  try {
    const response = await axios.get('/appointments/doctor/patients');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get patients by doctor ID
export const getPatientsByDoctorId = async (doctorId) => {
  try {
    const response = await axios.get(`/appointments/doctor/patients/${doctorId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cancel an appointment
export const cancelAppointment = async (appointmentId) => {
  try {
    const response = await axios.patch(`/appointments/cancel/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get available time slots for a specific doctor and date
export const getAvailableSlots = async (doctorId, date) => {
  try {
    const response = await axios.get(`/appointments/available-slots`, {
      params: { doctorId, date }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
