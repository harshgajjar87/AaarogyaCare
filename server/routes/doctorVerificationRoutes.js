const express = require('express');
const router = express.Router();
const {
  uploadFiles,
  submitVerification,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getUserVerificationStatus
} = require('../controllers/doctorVerificationController');
const { protect, admin } = require('../middleware/authMiddleware');

// Submit verification request (Authenticated users)
router.post('/submit', protect, uploadFiles, submitVerification);

// Get user's verification status (Authenticated users)
router.get('/status', protect, getUserVerificationStatus);

// Get pending verifications (Admin only)
router.get('/pending', protect, admin, getPendingVerifications);

// Get verification details by ID (Admin only)
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const verification = await require('../models/DoctorVerification').findById(req.params.id)
      .populate('userId', 'name email');
    if (!verification) {
      return res.status(404).json({ msg: 'Verification not found' });
    }
    res.json(verification);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// Approve verification (Admin only)
router.put('/approve/:id', protect, admin, approveVerification);

// Reject verification (Admin only)
router.put('/reject/:id', protect, admin, rejectVerification);

module.exports = router;
