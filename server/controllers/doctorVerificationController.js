const DoctorVerification = require('../models/DoctorVerification');
const User = require('../models/User');
const transporter = require('../config/mail');
const multer = require('multer');
const path = require('path');
const { createNotification } = require('./notificationController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/verifications/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF and JPG files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).fields([
  { name: 'idProof', maxCount: 1 },
  { name: 'license', maxCount: 1 }
]);

// Middleware for file upload
exports.uploadFiles = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ msg: err.message });
    }
    next();
  });
};

// Submit doctor verification request
exports.submitVerification = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user already has a pending or approved verification
    const existingVerification = await DoctorVerification.findOne({ userId });
    if (existingVerification) {
      if (existingVerification.status === 'pending') {
        return res.status(400).json({ msg: 'You already have a pending verification request' });
      }
      if (existingVerification.status === 'approved') {
        return res.status(400).json({ msg: 'Your account is already verified as a doctor' });
      }
    }

    // Check if files were uploaded
    if (!req.files || !req.files.idProof || !req.files.license) {
      return res.status(400).json({ msg: 'Both ID proof and license documents are required' });
    }

    const idProofPath = req.files.idProof[0].path;
    const licensePath = req.files.license[0].path;

    // Create verification request
    const verification = new DoctorVerification({
      userId,
      idProof: idProofPath,
      license: licensePath
    });

    await verification.save();

    // Update user role to pending_doctor
    await User.findByIdAndUpdate(userId, { role: 'pending_doctor' });

    // Send confirmation email
    const user = await User.findById(userId);
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: 'AarogyaCare - Doctor Verification Submitted',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">Doctor Verification Submitted</h2>
          <p>Hello ${user.name},</p>
          <p>Your doctor verification request has been submitted successfully. Our admin team will review your documents and get back to you within 2-3 business days.</p>
          <p>You will receive an email notification once your verification is approved or if additional information is required.</p>
          <p>Thank you for your patience.</p>
          <p>Best regards,<br>AarogyaCare Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      msg: 'Verification request submitted successfully',
      verification: {
        _id: verification._id,
        status: verification.status,
        submittedAt: verification.submittedAt
      }
    });
  } catch (err) {
    console.error('Submit verification error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Get pending verifications (Admin only)
exports.getPendingVerifications = async (req, res) => {
  try {
    const verifications = await DoctorVerification.find({ status: 'pending' })
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 });

    res.json(verifications);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Approve verification (Admin only)
exports.approveVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const verification = await DoctorVerification.findById(id);
    if (!verification) {
      return res.status(404).json({ msg: 'Verification request not found' });
    }

    if (verification.status !== 'pending') {
      return res.status(400).json({ msg: 'Verification is not pending' });
    }

    // Update verification
    verification.status = 'approved';
    verification.reviewedAt = new Date();
    verification.adminNotes = adminNotes || '';
    await verification.save();

    // Update user role
    await User.findByIdAndUpdate(verification.userId, { role: 'doctor' });

    // Send approval email
    const user = await User.findById(verification.userId);
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: 'AarogyaCare - Doctor Verification Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Doctor Verification Approved!</h2>
          <p>Hello Dr. ${user.name},</p>
          <p>Congratulations! Your doctor verification has been approved. You now have access to doctor-specific features on our platform.</p>
          <p>You can now:</p>
          <ul>
            <li>Manage your appointments</li>
            <li>Upload medical reports</li>
            <li>Access doctor dashboard</li>
            <li>Communicate with patients</li>
          </ul>
          <p>Please complete your doctor profile to start receiving appointments.</p>
          <p>Welcome to the AarogyaCare doctor community!</p>
          <p>Best regards,<br>AarogyaCare Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Notify all admins about the approval
    const admins = await User.find({ role: 'admin' });
    const notificationMessage = `Doctor verification approved for Dr. ${user.name}.`;
    for (const admin of admins) {
      await createNotification(admin._id, notificationMessage);
    }

    res.json({ msg: 'Verification approved successfully' });
  } catch (err) {
    console.error('Approve verification error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Reject verification (Admin only)
exports.rejectVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    if (!adminNotes || adminNotes.trim().length === 0) {
      return res.status(400).json({ msg: 'Admin notes are required for rejection' });
    }

    const verification = await DoctorVerification.findById(id);
    if (!verification) {
      return res.status(404).json({ msg: 'Verification request not found' });
    }

    if (verification.status !== 'pending') {
      return res.status(400).json({ msg: 'Verification is not pending' });
    }

    // Update verification
    verification.status = 'rejected';
    verification.reviewedAt = new Date();
    verification.adminNotes = adminNotes;
    await verification.save();

    // Reset user role to patient
    await User.findByIdAndUpdate(verification.userId, { role: 'patient' });

    // Send rejection email
    const user = await User.findById(verification.userId);
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: 'AarogyaCare - Doctor Verification Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Doctor Verification Update</h2>
          <p>Hello ${user.name},</p>
          <p>We regret to inform you that your doctor verification request has been reviewed and requires additional information or corrections.</p>
          <p><strong>Admin Notes:</strong></p>
          <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545;">${adminNotes}</p>
          <p>Please review the feedback and resubmit your verification request with the corrected documents.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>AarogyaCare Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ msg: 'Verification rejected successfully' });
  } catch (err) {
    console.error('Reject verification error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Get user's verification status
exports.getUserVerificationStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const verification = await DoctorVerification.findOne({ userId });

    if (!verification) {
      return res.json({ status: 'not_submitted' });
    }

    res.json({
      status: verification.status,
      submittedAt: verification.submittedAt,
      reviewedAt: verification.reviewedAt,
      adminNotes: verification.adminNotes
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};
