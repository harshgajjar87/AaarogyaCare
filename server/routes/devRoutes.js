const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// TEMPORARY ROUTE: Reset doctor password
router.get('/reset-doctor-password', async (req, res) => {
  const newPassword = '123456'; // You can change this
  const hashed = await bcrypt.hash(newPassword, 10);

  await User.updateOne(
    { email: 'harshgajjar062@gmail.com' },
    { $set: { password: hashed } }
  );

  res.json({ msg: 'Password reset to 123456' });
});

module.exports = router;
