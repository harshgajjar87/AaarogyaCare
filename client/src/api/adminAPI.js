import axios from '../utils/axios';

// Dashboard statistics
export const getTotalPatients = () => axios.get('/admin/patients/count');
export const getTotalDoctors = () => axios.get('/admin/doctors/count');
export const getTotalAppointments = () => axios.get('/admin/appointments/count');
export const getDoctorsBySpecialization = () => axios.get('/admin/doctors/by-specialization');
export const getAppointmentsByDoctor = () => axios.get('/admin/appointments/by-doctor');

// Management functions
export const getAllPatients = () => axios.get('/admin/patients');
export const getAllDoctors = () => axios.get('/admin/doctors');
export const getAllAppointments = () => axios.get('/admin/appointments');
export const togglePatientActiveStatus = (id) => axios.patch(`/admin/patients/${id}/toggle-active`);
