const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const transporter = require('../config/mail');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role: 'patient' // Set default role to 'patient'
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      msg: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Invalid email address' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found with this email' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to DB
    await Otp.findOneAndDelete({ email });
    const newOtp = new Otp({ email, otp });
    await newOtp.save();

    // Send password reset email
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Aarogya Clinic - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">Aarogya Clinic Password Reset</h2>
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password. Your password reset code is:</p>
          <p style="font-size: 24px; font-weight: bold; color: #2c5aa0; text-align: center; padding: 10px; background-color: #f0f8ff; border-radius: 5px;">${otp}</p>
          <p>This code will expire in 5 minutes. Please use it to reset your password.</p>
          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          <p>Best regards,<br>Aarogya Clinic Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ msg: 'Password reset OTP sent successfully to email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ msg: 'Email, OTP, and new password are required' });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    if (otpRecord.verified) {
      return res.status(400).json({ msg: 'OTP already used' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Mark OTP as used
    otpRecord.verified = true;
    await otpRecord.save();

    res.json({ msg: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};
