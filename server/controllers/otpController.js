const Otp = require('../models/Otp');
const { sendEmail } = require('../config/mailjetAPI');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Email
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Invalid email address' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to DB
    await Otp.findOneAndDelete({ email }); 
    const newOtp = new Otp({ email, otp });
    await newOtp.save();
    console.log(`OTP generated for ${email}: ${otp}`);

    // Send email using Mailjet API
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5aa0;">Aarogya Clinic Email Verification</h2>
        <p>Hello,</p>
        <p>Your verification code is: <strong style="font-size: 18px; color: #2c5aa0;">${otp}</strong></p>
        <p>This code will expire in 5 minutes. Please use it to complete your registration.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,<br>Aarogya Clinic Team</p>
      </div>
    `;

    console.log(`Attempting to send email to ${email}...`);
    await sendEmail({
      to: email,
      subject: 'Aarogya Clinic - Email Verification',
      html: html
    });

    res.json({ msg: 'OTP sent successfully to email', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (err) {
    console.error('❌ Send OTP error:', err);
    console.error('Error details:', {
      message: err.message,
      statusCode: err.statusCode
    });
    res.status(500).json({ 
      msg: 'Failed to send OTP. Please try again.', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ msg: 'Email and OTP are required' });
    }

    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    if (otpRecord.verified) {
      return res.status(400).json({ msg: 'OTP already used' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    res.json({ msg: 'OTP verified successfully' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    await Otp.findOneAndDelete({ email });

    const otp = generateOTP();
    const newOtp = new Otp({ email, otp });
    await newOtp.save();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5aa0;">Aarogya Clinic Email Verification</h2>
        <p>Hello,</p>
        <p>Your verification code is: <strong style="font-size: 18px; color: #2c5aa0;">${otp}</strong></p>
        <p>This code will expire in 5 minutes. Please use it to complete your registration.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,<br>Aarogya Clinic Team</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: 'Aarogya Clinic - Email Verification',
      html: html
    });

    res.json({ msg: 'OTP resent successfully', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Send OTP for email change
exports.sendEmailChangeOTP = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user._id; // Fixed: use _id instead of userId

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      return res.status(400).json({ msg: 'Invalid email address' });
    }

    // Check if email already exists
    const User = require('../models/User');
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      return res.status(400).json({ msg: 'Email already in use by another account' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to DB with special identifier for email change
    await Otp.findOneAndDelete({ email: newEmail });
    const newOtp = new Otp({ email: newEmail, otp });
    await newOtp.save();

    console.log(`Email change OTP generated for ${newEmail}: ${otp}`);

    // Send email using Mailjet API
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5aa0;">Aarogya Clinic Email Change Verification</h2>
        <p>Hello,</p>
        <p>You have requested to change your email address. Your verification code is:</p>
        <p style="font-size: 24px; font-weight: bold; color: #2c5aa0; text-align: center; padding: 10px; background-color: #f0f8ff; border-radius: 5px;">${otp}</p>
        <p>This code will expire in 5 minutes. Please use it to verify your new email address.</p>
        <p>If you didn't request this change, please ignore this email and your email address will remain unchanged.</p>
        <p>Best regards,<br>Aarogya Clinic Team</p>
      </div>
    `;

    await sendEmail({
      to: newEmail,
      subject: 'Aarogya Clinic - Email Change Verification',
      html: html
    });

    res.json({ msg: 'Verification code sent to new email address', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (err) {
    console.error('❌ Send email change OTP error:', err);
    res.status(500).json({ 
      msg: 'Failed to send verification code. Please try again.', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
  }
};

// Verify OTP and change email
exports.verifyAndChangeEmail = async (req, res) => {
  try {
    const { newEmail, otp } = req.body;
    const userId = req.user._id; // Fixed: use _id instead of userId

    if (!newEmail || !otp) {
      return res.status(400).json({ msg: 'New email and OTP are required' });
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({ email: newEmail, otp });

    if (!otpRecord) {
      return res.status(400).json({ msg: 'Invalid verification code' });
    }

    if (otpRecord.verified) {
      return res.status(400).json({ msg: 'Verification code already used' });
    }

    // Check if email is still available
    const User = require('../models/User');
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      return res.status(400).json({ msg: 'Email already in use by another account' });
    }

    // Update user email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const oldEmail = user.email;
    user.email = newEmail;
    await user.save();

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Send confirmation email to old email
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5aa0;">Aarogya Clinic Email Changed</h2>
        <p>Hello ${user.name},</p>
        <p>Your email address has been successfully changed from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p>Best regards,<br>Aarogya Clinic Team</p>
      </div>
    `;

    try {
      await sendEmail({
        to: oldEmail,
        subject: 'Aarogya Clinic - Email Address Changed',
        html: confirmationHtml
      });
    } catch (emailErr) {
      console.error('Failed to send confirmation to old email:', emailErr);
      // Don't fail the request if confirmation email fails
    }

    res.json({ msg: 'Email address changed successfully', newEmail });
  } catch (err) {
    console.error('Verify and change email error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};