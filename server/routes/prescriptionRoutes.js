const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { protect, isDoctor, isPatient } = require('../middleware/authMiddleware');

// Mark patient as visited
router.put('/visit/:appointmentId', protect, isDoctor, prescriptionController.markPatientVisited);

// Create prescription
router.post('/', protect, isDoctor, prescriptionController.createPrescription);

// Get patient prescriptions (for patients)
router.get('/patient', protect, prescriptionController.getPatientPrescriptions);

// Get doctor prescriptions (for doctors)
router.get('/doctor', protect, isDoctor, prescriptionController.getDoctorPrescriptions);

// Get patient details for doctor
router.get('/patient-details/:patientId', protect, isDoctor, prescriptionController.getPatientDetails);

module.exports = router;