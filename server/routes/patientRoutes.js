const express = require('express');
const router = express.Router();
const { getAllPatients } = require('../controllers/patientController');
const { protect, isDoctor } = require('../middleware/authMiddleware');

// Get all patients (for doctors)
router.get('/all', protect, isDoctor, getAllPatients);

module.exports = router;
