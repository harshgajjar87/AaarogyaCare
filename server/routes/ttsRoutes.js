const express = require('express');
const router = express.Router();
const { textToSpeech } = require('../controllers/ttsController');
const { protect } = require('../middleware/authMiddleware');

router.post('/synthesize', protect, textToSpeech);

module.exports = router;
