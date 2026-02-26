const express = require('express');
const router = express.Router();
const { getDoctorAnalytics, getAdminAnalytics } = require('../controllers/analyticsController');
const { protect, isDoctor, admin } = require('../middleware/authMiddleware');

router.get('/doctor', protect, isDoctor, getDoctorAnalytics);
router.get('/admin', protect, admin, getAdminAnalytics);

module.exports = router;
