const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  res.json(notifications);
};

exports.markAsSeen = async (req, res) => {
  await Notification.updateMany({ userId: req.params.userId, seen: false }, { seen: true });
  res.json({ msg: 'Marked as seen' });
};

exports.clearNotifications = async (req, res) => {
  await Notification.deleteMany({ userId: req.params.userId });
  res.json({ msg: 'Notifications cleared' });
};

exports.createNotification = async (userId, message) => {
  await Notification.create({ userId, message });
};
