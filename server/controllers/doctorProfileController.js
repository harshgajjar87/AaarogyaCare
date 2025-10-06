const User = require('../models/User');
// const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');


// Get doctor profile
const getDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. User is not a doctor' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, profile, doctorDetails } = req.body;
    
    // Debug log to see what data is received
    console.log('Received update data:', { name, profile, doctorDetails });
    console.log('Expertise data received:', doctorDetails?.expertise);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. User is not a doctor' });
    }

    // Update name if provided
    if (name) {
      user.name = name.trim();
    }

    // Update profile data if provided
    if (profile) {
      // Validate profile data
      if (profile.age !== undefined) {
        const age = parseInt(profile.age);
        if (isNaN(age) || age < 0 || age > 120) {
          return res.status(400).json({ message: 'Age must be a valid number between 0 and 120' });
        }
        profile.age = age;
      }

      if (profile.gender && !['male', 'female', 'other'].includes(profile.gender)) {
        return res.status(400).json({ message: 'Invalid gender value' });
      }

      if (profile.phone && profile.phone.trim() === '') {
        return res.status(400).json({ message: 'Phone number is required' });
      }

      if (profile.bloodGroup && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(profile.bloodGroup)) {
        return res.status(400).json({ message: 'Invalid blood group value' });
      }

      if (profile.emergencyContact && profile.emergencyContact.trim() === '') {
        return res.status(400).json({ message: 'Emergency contact is required' });
      }

      user.profile = {
        ...user.profile,
        ...profile
      };
    }

    // Update doctorDetails if provided
    if (doctorDetails) {
      user.doctorDetails = { ...user.doctorDetails, ...doctorDetails };
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload clinic images
const uploadClinicImages = async (req, res) => {
  try {
    console.log("Starting clinic image upload for user:", req.user.id);
    console.log("Files received:", req.files ? req.files.length : "none");

    const user = await User.findById(req.user.id);
    console.log("User found:", user ? "yes" : "no");

    if (user) {
      console.log("Current doctorDetails:", user.doctorDetails);
      console.log("Current clinicImages:", user.doctorDetails?.clinicImages || "not set");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== 'doctor') {
      return res.status(403).json({ message: "Access denied. User is not a doctor" });
    }

    // Ensure doctorDetails object exists
    if (!user.doctorDetails) {
      user.doctorDetails = {};
      console.log("Created new doctorDetails object");
    }

    // Ensure clinicImages array exists
    if (!user.doctorDetails.clinicImages || !Array.isArray(user.doctorDetails.clinicImages)) {
      user.doctorDetails.clinicImages = [];
      console.log("Created new clinicImages array");
    } else {
      console.log("Existing clinicImages array found with", user.doctorDetails.clinicImages.length, "images");
    }

    if (!req.files || req.files.length === 0) {
      console.log("No files received in request");
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Limit total clinic images to 10
    const maxImages = 10;
    const currentImages = user.doctorDetails.clinicImages.length;
    const newImages = req.files.length;

    if (currentImages + newImages > maxImages) {
      return res.status(400).json({
        message: `Cannot upload more than ${maxImages} clinic images. You currently have ${currentImages} images.`
      });
    }

    const imageUrls = req.files.map(file => `/uploads/clinic-images/${file.filename}`);
    console.log("Generated image URLs:", imageUrls);

    user.doctorDetails.clinicImages.push(...imageUrls);
    console.log("Updated clinicImages array:", user.doctorDetails.clinicImages);

    console.log("User object before save:", {
      _id: user._id,
      doctorDetails: {
        clinicImages: user.doctorDetails.clinicImages
      }
    });

    const savedUser = await user.save();
    console.log("User saved successfully. Updated clinic images:", savedUser.doctorDetails.clinicImages);

    // Verify the changes were persisted
    const updatedUser = await User.findById(user._id);
    console.log("Verified clinic images in database:", updatedUser.doctorDetails.clinicImages);

    res.json({
      message: "Clinic images uploaded successfully",
      clinicImages: user.doctorDetails.clinicImages,
      uploadedCount: newImages
    });
  } catch (err) {
    console.error("Error uploading clinic images:", err);
    res.status(500).json({ message: "Error uploading clinic images", error: err.message });
  }
};

// Delete clinic image
const deleteClinicImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { imageUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. User is not a doctor' });
    }

    // Remove image from array
    user.doctorDetails.clinicImages = user.doctorDetails.clinicImages.filter(
      img => img !== imageUrl
    );

    // Delete physical file - fix the path construction
    const filePath = path.join(__dirname, '..', imageUrl.replace(/^\//, ''));
    console.log('Attempting to delete file:', filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('File deleted successfully');
    } else {
      console.log('File does not exist:', filePath);
    }

    await user.save();
    res.json({
      message: 'Image deleted successfully',
      images: user.doctorDetails.clinicImages
    });
  } catch (error) {
    console.error('Error deleting clinic image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update availability
const updateAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { availability } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. User is not a doctor' });
    }

    // Validate availability data
    if (!Array.isArray(availability)) {
      return res.status(400).json({ message: 'Availability must be an array' });
    }

    // Check for overlapping time slots
    for (const slot of availability) {
      if (!slot.day || !slot.startTime || !slot.endTime) {
        return res.status(400).json({ message: 'All availability fields are required' });
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
        return res.status(400).json({ message: 'Invalid time format. Use HH:MM' });
      }

      // Check if end time is after start time
      if (slot.startTime >= slot.endTime) {
        return res.status(400).json({ message: 'End time must be after start time' });
      }
    }

    user.doctorDetails.availability = availability;
    await user.save();

    res.json({
      message: 'Availability updated successfully',
      availability: user.doctorDetails.availability
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDoctorProfile,
  updateDoctorProfile,
  uploadClinicImages,
  deleteClinicImage,
  updateAvailability,
  upload
};
