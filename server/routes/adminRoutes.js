const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getTotalPatients,
  getTotalDoctors,
  getTotalAppointments,
  getDoctorsBySpecialization,
  getAppointmentsByDoctor,
  getAllPatients,
  getAllDoctors,
  getAllAppointments,
  togglePatientActiveStatus,
  getQueries,
  replyToQuery
} = require('../controllers/adminController');

// All routes require authentication and admin privileges
router.use(protect, admin);

// Dashboard statistics routes
router.get('/patients/count', getTotalPatients);
router.get('/doctors/count', getTotalDoctors);
router.get('/appointments/count', getTotalAppointments);
router.get('/doctors/by-specialization', getDoctorsBySpecialization);
router.get('/appointments/by-doctor', getAppointmentsByDoctor);

// Management routes
router.get('/patients', getAllPatients);
router.get('/doctors', getAllDoctors);
router.get('/appointments', getAllAppointments);
router.patch('/patients/:id/toggle-active', togglePatientActiveStatus);

// Queries routes
router.get('/queries', getQueries);
router.post('/queries/:id/reply', replyToQuery);

module.exports = router;
