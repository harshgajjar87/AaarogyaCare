const express = require('express');
const router = express.Router();
const { triageChat, findDoctors } = require('../controllers/triageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, triageChat);
router.post('/find-doctors', protect, findDoctors);

// Test endpoint
router.get('/test', protect, (req, res) => {
  res.json({ 
    message: 'Triage API is working',
    hasApiKey: !!process.env.GOOGLE_API_KEY,
    user: req.user.name
  });
});

module.exports = router;
