const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', otpController.sendOTP);
router.post('/verify', otpController.verifyOTP);
router.post('/resend', otpController.resendOTP);

// Email change routes (protected)
router.post('/send-email-change', protect, otpController.sendEmailChangeOTP);
router.post('/verify-email-change', protect, otpController.verifyAndChangeEmail);

module.exports = router;
