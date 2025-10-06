const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const doctorProfileController = require('../controllers/doctorProfileController');
const { protect } = require('../middleware/authMiddleware');
const { clinicUpload, handleMulterError } = require('../middleware/clinicUpload');

// Public routes
router.get('/', doctorController.getAllDoctors);
router.get('/specializations', doctorController.getSpecializations);
router.get('/:id', doctorController.getDoctorById);

// Protected routes (for doctors)
router.get('/profile/me', protect, doctorProfileController.getDoctorProfile);
router.put('/profile', protect, doctorProfileController.updateDoctorProfile);
router.post('/upload-clinic-images', protect, clinicUpload.array('clinicImages', 5), handleMulterError, doctorProfileController.uploadClinicImages);
router.delete('/clinic-images', protect, doctorProfileController.deleteClinicImage);
router.put('/availability', protect, doctorProfileController.updateAvailability);

module.exports = router;
