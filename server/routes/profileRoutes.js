const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, uploadProfileImage, handleProfileImageUpload, getUserProfileById } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// Get user profile
router.get('/me', protect, getUserProfile);

// Update user profile
router.put('/update', protect, updateUserProfile);

// Upload profile image
router.post('/upload-image', protect, uploadProfileImage, handleProfileImageUpload);

// Get user profile by ID
router.get('/user/:userId', protect, getUserProfileById);

module.exports = router;
