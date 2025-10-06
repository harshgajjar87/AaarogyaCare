const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, isDoctor, isPatient } = require('../middleware/authMiddleware');

// --- Patient Routes ---

// POST /api/appointments - Patient creates a new appointment.
router.post('/', protect, isPatient, appointmentController.createAppointment);

// GET /api/appointments/patient/:id - Patient views their own appointments.
router.get('/patient/:id', protect, isPatient, appointmentController.getAppointmentsByPatientId);

// PATCH /api/appointments/cancel/:id - Patient cancels their appointment.
router.patch('/cancel/:id', protect, isPatient, appointmentController.cancelAppointment);

// --- Doctor Routes ---

// GET /api/appointments/doctor - Doctor views their appointments.
router.get('/doctor', protect, isDoctor, appointmentController.getDoctorAppointments);

// GET /api/appointments/doctor/pending - Doctor views pending appointments.
router.get('/doctor/pending', protect, isDoctor, appointmentController.getDoctorPendingAppointments);

// GET /api/appointments/doctor/patients - Doctor views their unique patients.
router.get('/doctor/patients', protect, isDoctor, appointmentController.getDoctorPatients);
router.get('/doctor/patients/:doctorId', protect, isDoctor, appointmentController.getDoctorPatients);

// PUT /api/appointments/approve/:id - Doctor approves an appointment.
router.put('/approve/:id', protect, isDoctor, appointmentController.approveAppointment);

// PUT /api/appointments/reject/:id - Doctor rejects an appointment.
router.put('/reject/:id', protect, isDoctor, appointmentController.rejectAppointment);

// NEW: Export appointments to Excel
router.get('/export', protect, isDoctor, appointmentController.exportAppointmentsToExcel);

// --- Admin/Doctor Routes ---

// GET /api/appointments/all - Get all appointments assigned to the logged-in doctor.
router.get('/all', protect, appointmentController.getAllAppointments);

// GET /api/appointments/available-slots - Get available time slots for a doctor on a specific date
router.get('/available-slots', appointmentController.getAvailableSlots);

module.exports = router;
