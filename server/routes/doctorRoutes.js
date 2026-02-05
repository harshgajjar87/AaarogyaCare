const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const doctorProfileController = require('../controllers/doctorProfileController');
const appointmentController = require('../controllers/appointmentController');
const { protect, isDoctor } = require('../middleware/authMiddleware');
const { clinicUpload, handleMulterError } = require('../middleware/clinicUpload');

// Public routes
router.get('/', doctorController.getAllDoctors);
router.get('/specializations', doctorController.getSpecializations);

// Protected routes (for doctors) - MUST come before /:id route
router.get('/patients', protect, isDoctor, appointmentController.getDoctorPatients);
router.get('/patients/:patientId', protect, isDoctor, appointmentController.getPatientDetails);
router.get('/profile/me', protect, doctorProfileController.getDoctorProfile);
router.put('/profile', protect, doctorProfileController.updateDoctorProfile);
router.post('/upload-clinic-images', protect, clinicUpload.array('clinicImages', 5), handleMulterError, doctorProfileController.uploadClinicImages);
router.delete('/clinic-images', protect, doctorProfileController.deleteClinicImage);
router.put('/availability', protect, doctorProfileController.updateAvailability);

// Parameterized route - MUST come last
router.get('/:id', doctorController.getDoctorById);

module.exports = router;
