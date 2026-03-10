const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contactController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Public route for submitting contact form (with optional auth to track user if logged in)
router.post('/', optionalAuth, submitContact);

module.exports = router;
