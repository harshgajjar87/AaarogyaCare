const express = require('express');
const router = express.Router();
const notificationCtrl = require('../controllers/notificationController');

router.get('/:userId', notificationCtrl.getNotifications);
router.post('/mark-seen/:userId', notificationCtrl.markAsSeen);
router.delete('/clear/:userId', notificationCtrl.clearNotifications);

module.exports = router;
