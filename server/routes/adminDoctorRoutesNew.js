const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const doctorController = require('../controllers/adminDoctorControllerNew');

// All routes require authentication and admin role
router.use(protect, admin);

// GET /api/admin/doctors/new - Get all doctors with complete information
router.get('/', doctorController.getAllDoctorsComplete);

// GET /api/admin/doctors/new/:id - Get a specific doctor with complete information
router.get('/:id', doctorController.getDoctorByIdComplete);

// GET /api/admin/doctors/new/specialization/:specialization - Get doctors by specialization
router.get('/specialization/:specialization', doctorController.getDoctorsBySpecialization);

// PATCH /api/admin/doctors/new/:id/toggle-active - Toggle doctor active status
router.patch('/:id/toggle-active', doctorController.toggleDoctorActiveStatus);

module.exports = router;
