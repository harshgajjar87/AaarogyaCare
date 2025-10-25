const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Correct path: use path.join with __dirname and go up one level to server root
    const uploadDir = path.join(__dirname, '..', 'uploads', 'profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profileImage-' + uniqueSuffix + path.extname(file.originalname));
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

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Ensure profile exists for existing users
    if (!user.profile) {
      user.profile = {
        age: null,
        gender: '',
        phone: '',
        address: '',
        bloodGroup: '',
        emergencyContact: ''
      };
      await user.save();
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, profile, doctorDetails } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ msg: 'Name is required' });
    }

    // Validate gender if provided
    if (profile && profile.gender) {
      if (!['male', 'female', 'other'].includes(profile.gender)) {
        return res.status(400).json({ msg: 'Invalid gender value' });
      }
    }

    // Ensure age is a number
    if (profile && profile.age !== undefined) {
      const age = parseInt(profile.age);
      if (isNaN(age) || age < 0 || age > 120) {
        return res.status(400).json({ msg: 'Age must be a valid number between 0 and 120' });
      }
      profile.age = age;
    }

    // Validate doctorDetails if provided
    if (doctorDetails) {
      if (doctorDetails.experience !== undefined) {
        const experience = parseInt(doctorDetails.experience);
        if (isNaN(experience) || experience < 0) {
          return res.status(400).json({ msg: 'Experience must be a valid number' });
        }
        doctorDetails.experience = experience;
      }

      if (doctorDetails.consultationFee !== undefined) {
        const fee = parseInt(doctorDetails.consultationFee);
        if (isNaN(fee) || fee < 0) {
          return res.status(400).json({ msg: 'Consultation fee must be a valid number' });
        }
        doctorDetails.consultationFee = fee;
      }

      // Validate expertise if provided
      if (doctorDetails.expertise) {
        // Ensure expertise is an object with conditions and treatments arrays
        if (typeof doctorDetails.expertise !== 'object') {
          return res.status(400).json({ msg: 'Expertise must be an object' });
        }

        // Validate conditions array
        if (doctorDetails.expertise.conditions) {
          if (!Array.isArray(doctorDetails.expertise.conditions)) {
            return res.status(400).json({ msg: 'Expertise conditions must be an array' });
          }
          // Filter out empty strings and trim each condition
          doctorDetails.expertise.conditions = doctorDetails.expertise.conditions
            .map(condition => condition.trim())
            .filter(condition => condition !== '');
        }

        // Validate treatments array
        if (doctorDetails.expertise.treatments) {
          if (!Array.isArray(doctorDetails.expertise.treatments)) {
            return res.status(400).json({ msg: 'Expertise treatments must be an array' });
          }
          // Filter out empty strings and trim each treatment
          doctorDetails.expertise.treatments = doctorDetails.expertise.treatments
            .map(treatment => treatment.trim())
            .filter(treatment => treatment !== '');
        }
      }
    }

    const updateData = { name: name.trim(), profile };

    // Only include doctorDetails if provided and user is a doctor
    const user = await User.findById(userId);
    if (user.role === 'doctor' && doctorDetails) {
      // Preserve existing clinicImages if they exist
      if (user.doctorDetails && user.doctorDetails.clinicImages) {
        doctorDetails.clinicImages = user.doctorDetails.clinicImages;
      }
      updateData.doctorDetails = doctorDetails;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Upload profile image
exports.uploadProfileImage = upload.single('profileImage');

// Handle profile image upload
exports.handleProfileImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const userId = req.user._id;
    const profileImagePath = `/uploads/profiles/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: profileImagePath },
      { new: true }
    ).select('-password');

    res.json({
      msg: 'Profile image updated successfully',
      profileImage: profileImagePath,
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// Get user profile by ID (for viewing other profiles)
exports.getUserProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};