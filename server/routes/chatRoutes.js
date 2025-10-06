
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

// All routes require authentication
router.use(protect);

// Create or access a chat for an approved appointment
router.post('/', chatController.createOrAccessChat);

// Get all active chats for the authenticated user
router.get('/', chatController.getUserChats);

// Get a specific chat by ID
router.get('/:chatId', chatController.getChatById);

// Send a message in a specific chat
router.post('/:chatId/messages', chatController.sendMessage);

// Extend chat expiration (for approved appointments)
router.put('/:chatId/extend', chatController.extendChatExpiration);

// End chat by doctor
router.put('/:chatId/end', chatController.endChat);

// Debug endpoint: Check if user has approved appointments
router.get('/debug/approved-appointments', chatController.checkApprovedAppointments);

// Debug endpoint: Create test chat (development only)
router.post('/debug/test-chat', chatController.createTestChat);

// Health check endpoint
router.get('/health', chatController.healthCheck);

module.exports = router;
