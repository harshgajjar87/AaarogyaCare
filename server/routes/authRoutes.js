const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, googleAuth } = require('../controllers/authController');
const { uploadFiles, submitVerification } = require('../controllers/doctorVerificationController');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

// @route   POST /api/auth/register-doctor
// @desc    Register a new doctor account + submit verification docs in one step
router.post('/register-doctor', uploadFiles, async (req, res) => {
  try {
    const { name, email, password, phone, age, gender, specialization, experience, qualifications, clinicName, clinicAddress, consultationFee } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already registered' });

    if (!req.files || !req.files.idProof || !req.files.license) {
      return res.status(400).json({ msg: 'Both ID proof and license documents are required' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role: 'pending_doctor',
      profile: { phone: phone || '', age: age || '', gender: gender || '' },
      doctorDetails: {
        specialization: specialization || '',
        experience: experience || 0,
        qualifications: qualifications ? qualifications.split(',').map(q => q.trim()) : [],
        clinicName: clinicName || '',
        clinicAddress: clinicAddress || '',
        consultationFee: consultationFee || 0
      }
    });

    await user.save();

    // Create verification record
    const DoctorVerification = require('../models/DoctorVerification');
    const Notification = require('../models/Notification');
    const transporter = require('../config/mail');

    const verification = new DoctorVerification({
      userId: user._id,
      idProof: req.files.idProof[0].path,
      license: req.files.license[0].path
    });
    await verification.save();

    // Notify admins
    const admins = await User.find({ role: 'admin' }).select('_id').lean();
    if (admins.length > 0) {
      await Notification.insertMany(admins.map(a => ({
        userId: a._id,
        message: `New doctor registration pending verification: ${name}`
      })));
    }

    // Send confirmation email (non-blocking)
    if (process.env.MAIL_USER) {
      transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: 'AarogyaCare - Doctor Registration Received',
        html: `<p>Hello ${name},</p><p>Your registration has been received. Our admin team will review your documents within 2-3 business days and notify you by email.</p><p>Best regards,<br>AarogyaCare Team</p>`
      }).catch(err => console.error('Registration email error:', err));
    }

    res.status(201).json({ msg: 'Registration submitted successfully. Please wait for admin approval.' });
  } catch (err) {
    console.error('Doctor register error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

module.exports = router;
