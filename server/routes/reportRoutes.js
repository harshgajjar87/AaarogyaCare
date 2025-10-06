const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, isDoctor } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { validateDoctorPatientRelationship } = require('../middleware/reportValidation');

// ✅ Upload Report (Doctor to Patient) - with validation
router.post('/upload/:patientId', 
  protect, 
  isDoctor,
  validateDoctorPatientRelationship,
  upload.single('report'), 
  reportController.uploadReport
);

// ✅ Get Reports for Logged-in Patient
router.get('/patient', protect, reportController.getPatientReports);

// ✅ Get All Reports (for Doctor Dashboard)
router.get('/all', protect, reportController.getAllReports);

module.exports = router;
