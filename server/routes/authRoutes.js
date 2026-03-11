const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, googleAuth } = require('../controllers/authController');

// @route   POST /api/auth/register
router.post('/register', register);

// @route   POST /api/auth/login
router.post('/login', login);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// @route   POST /api/auth/google
router.post('/google', googleAuth);

module.exports = router;
