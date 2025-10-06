const Otp = require('../models/Otp');
const transporter = require('../config/mail');

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

    // Send email
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Aarogya Clinic - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">Aarogya Clinic Email Verification</h2>
          <p>Hello,</p>
          <p>Your verification code is: <strong style="font-size: 18px; color: #2c5aa0;">${otp}</strong></p>
          <p>This code will expire in 5 minutes. Please use it to complete your registration.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>Aarogya Clinic Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ msg: 'OTP sent successfully to email', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
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

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Aarogya Clinic - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">Aarogya Clinic Email Verification</h2>
          <p>Hello,</p>
          <p>Your verification code is: <strong style="font-size: 18px; color: #2c5aa0;">${otp}</strong></p>
          <p>This code will expire in 5 minutes. Please use it to complete your registration.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>Aarogya Clinic Team</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({ msg: 'OTP resent successfully', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};