const User = require('../models/User');
const mongoose = require('mongoose');
const { normalizeSpecialization, buildSpecRegex } = require('../utils/normalizeSpecialization');

// Get all doctors with filtering
const getAllDoctors = async (req, res) => {
  try {
    const { 
      specialization, 
      location, 
      minRating, 
      maxFee,
      search,
      page = 1,
      limit = 10 
    } = req.query;

    let query = { role: 'doctor' };
    
    // Specialization filter — matches canonical form and all variants (ology/ologist)
    if (specialization) {
      query['doctorDetails.specialization'] = { $regex: buildSpecRegex(specialization) };
    }
    
    // Rating filter
    if (minRating) {
      query['doctorDetails.rating'] = { $gte: parseFloat(minRating) };
    }
    
    // Fee filter
    if (maxFee) {
      query['doctorDetails.consultationFee'] = { $lte: parseFloat(maxFee) };
    }
    
    // Search by name or clinic
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'doctorDetails.clinicName': { $regex: search, $options: 'i' } },
        { 'doctorDetails.specialization': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Location-based search (if coordinates provided)
    if (location && location.coordinates) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: location.coordinates
          },
          $maxDistance: location.maxDistance || 10000 // 10km default
        }
      };
    }

    const doctors = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'doctorDetails.rating': -1 });

    const total = await User.countDocuments(query);

    res.json({
      doctors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single doctor details
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
    const doctor = await User.findById(id)
      .select('-password');
    
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const { 
      specialization,
      experience,
      qualifications,
      clinicName,
      clinicAddress,
      consultationFee,
      availability,
      about,
      profile // Add profile to the destructured request body
    } = req.body;

    // Validate profile data
    if (profile) {
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
    }

    const doctor = await User.findById(req.user.id);
    
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Update doctor details
    doctor.doctorDetails = {
      ...doctor.doctorDetails,
      specialization,
      experience,
      qualifications,
      clinicName,
      clinicAddress,
      consultationFee,
      availability,
      about
    };

    // Update profile data
    if (profile) {
      doctor.profile = {
        ...doctor.profile,
        ...profile
      };
    }

    await doctor.save();
    
    res.json({ 
      message: 'Doctor profile updated successfully',
      doctor: doctor.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } })
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload clinic images
const uploadClinicImages = async (req, res) => {
  try {
    const doctor = await User.findById(req.user.id);
    
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(file => file.path);
      doctor.doctorDetails.clinicImages = [
        ...doctor.doctorDetails.clinicImages,
        ...imagePaths
      ];
      await doctor.save();
    }

    res.json({ 
      message: 'Clinic images uploaded successfully',
      images: doctor.doctorDetails.clinicImages 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get doctor specializations — normalizes all DB variants to canonical "ologist" form
// Also fixes any dirty records in DB on the fly
const getSpecializations = async (req, res) => {
  try {
    const { SPEC_CORRECTIONS } = require('../utils/normalizeSpecialization');
    const raw = await User.distinct('doctorDetails.specialization', {
      role: 'doctor',
      'doctorDetails.specialization': { $exists: true, $ne: '' }
    });

    // Fix dirty DB records in background (don't await — don't block the response)
    const bulkOps = [];
    for (const spec of raw) {
      const canonical = normalizeSpecialization(spec);
      if (canonical !== spec) {
        bulkOps.push({
          updateMany: {
            filter: { role: 'doctor', 'doctorDetails.specialization': spec },
            update: { $set: { 'doctorDetails.specialization': canonical } }
          }
        });
      }
    }
    if (bulkOps.length > 0) {
      User.bulkWrite(bulkOps).then(r =>
        console.log(`Normalized ${r.modifiedCount} specialization record(s) in DB`)
      ).catch(e => console.error('Specialization bulk normalize error:', e.message));
    }

    const normalized = [...new Set(raw.map(normalizeSpecialization))].sort();
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  uploadClinicImages,
  getSpecializations
};
