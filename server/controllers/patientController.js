const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Get patient profile
exports.getPatientProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patient = await User.findById(userId).select('-password');
    
    if (!patient) {
      return res.status(404).json({ msg: 'Patient not found' });
    }

    res.json(patient);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Update patient profile
exports.updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, address, dateOfBirth, bloodGroup, emergencyContact } = req.body;

    const updatedPatient = await User.findByIdAndUpdate(
      userId,
      { name, phone, address, dateOfBirth, bloodGroup, emergencyContact },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedPatient);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Configure multer for profile image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'server/uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload profile image
exports.uploadProfileImage = upload.single('profileImage');

// Handle profile image upload
exports.handleProfileImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const userId = req.user.userId;
    const profileImagePath = `/uploads/profiles/${req.file.filename}`;

    const updatedPatient = await User.findByIdAndUpdate(
      userId,
      { profileImage: profileImagePath },
      { new: true }
    ).select('-password');

    res.json({ 
      msg: 'Profile image updated successfully', 
      profileImage: profileImagePath,
      patient: updatedPatient 
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Get all registered patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' })
      .select('name email createdAt profileImage')
      .sort({ createdAt: -1 });
    
    res.json(patients);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching patients', error: err.message });
  }
};
