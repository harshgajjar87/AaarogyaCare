const User = require('../models/User');

// GET /api/admin/doctors/new - Get all doctors with complete information
exports.getAllDoctorsComplete = async (req, res) => {
  try {
    console.log('Fetching all doctors with complete information...');

    // Fetch all doctors without any field limitations
    const doctors = await User.find({ role: 'doctor' }).lean();

    console.log('Raw data from database:', JSON.stringify(doctors[0], null, 2));

    // Process each doctor to ensure all fields are included
    const processedDoctors = doctors.map(doctor => {
      // Create a new object with all fields from the doctor document
      const processedDoctor = {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role,
        isActive: doctor.isActive !== undefined ? doctor.isActive : true,
        profileImage: doctor.profileImage || '',
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt
      };

      // Add profile information
      if (doctor.profile) {
        processedDoctor.profile = {
          age: doctor.profile.age || 0,
          gender: doctor.profile.gender || '',
          phone: doctor.profile.phone || '',
          address: doctor.profile.address || '',
          bloodGroup: doctor.profile.bloodGroup || '',
          emergencyContact: doctor.profile.emergencyContact || ''
        };
      } else {
        processedDoctor.profile = {
          age: 0,
          gender: '',
          phone: '',
          address: '',
          bloodGroup: '',
          emergencyContact: ''
        };
      }

      // Add doctor details
      if (doctor.doctorDetails) {
        processedDoctor.doctorDetails = {
          specialization: doctor.doctorDetails.specialization || '',
          experience: doctor.doctorDetails.experience || 0,
          qualifications: doctor.doctorDetails.qualifications || [],
          clinicName: doctor.doctorDetails.clinicName || '',
          clinicAddress: doctor.doctorDetails.clinicAddress || '',
          clinicImages: doctor.doctorDetails.clinicImages || [],
          consultationFee: doctor.doctorDetails.consultationFee || 0,
          availability: doctor.doctorDetails.availability || [],
          about: doctor.doctorDetails.about || '',
          rating: doctor.doctorDetails.rating || 0,
          totalReviews: doctor.doctorDetails.totalReviews || 0,
          expertise: {
            conditions: doctor.doctorDetails.expertise?.conditions || [],
            treatments: doctor.doctorDetails.expertise?.treatments || []
          }
        };
      } else {
        processedDoctor.doctorDetails = {
          specialization: '',
          experience: 0,
          qualifications: [],
          clinicName: '',
          clinicAddress: '',
          clinicImages: [],
          consultationFee: 0,
          availability: [],
          about: '',
          rating: 0,
          totalReviews: 0,
          expertise: {
            conditions: [],
            treatments: []
          }
        };
      }

      // Add location if it exists
      if (doctor.location) {
        processedDoctor.location = doctor.location;
      }

      return processedDoctor;
    });

    console.log('Processed data:', JSON.stringify(processedDoctors[0], null, 2));

    // Return the processed data
    res.status(200).json({
      success: true,
      count: processedDoctors.length,
      doctors: processedDoctors
    });
  } catch (error) {
    console.error('Error in getAllDoctorsComplete:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET /api/admin/doctors/new/:id - Get a specific doctor with complete information
exports.getDoctorByIdComplete = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Fetching doctor with ID: ${id}`);

    // Find the doctor by ID
    const doctor = await User.findOne({ _id: id, role: 'doctor' }).lean();

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    console.log('Raw data from database:', JSON.stringify(doctor, null, 2));

    // Process the doctor data
    const processedDoctor = {
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      role: doctor.role,
      isActive: doctor.isActive !== undefined ? doctor.isActive : true,
      profileImage: doctor.profileImage || '',
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    };

    // Add profile information
    if (doctor.profile) {
      processedDoctor.profile = {
        age: doctor.profile.age || 0,
        gender: doctor.profile.gender || '',
        phone: doctor.profile.phone || '',
        address: doctor.profile.address || '',
        bloodGroup: doctor.profile.bloodGroup || '',
        emergencyContact: doctor.profile.emergencyContact || ''
      };
    } else {
      processedDoctor.profile = {
        age: 0,
        gender: '',
        phone: '',
        address: '',
        bloodGroup: '',
        emergencyContact: ''
      };
    }

    // Add doctor details
    if (doctor.doctorDetails) {
      processedDoctor.doctorDetails = {
        specialization: doctor.doctorDetails.specialization || '',
        experience: doctor.doctorDetails.experience || 0,
        qualifications: doctor.doctorDetails.qualifications || [],
        clinicName: doctor.doctorDetails.clinicName || '',
        clinicAddress: doctor.doctorDetails.clinicAddress || '',
        clinicImages: doctor.doctorDetails.clinicImages || [],
        consultationFee: doctor.doctorDetails.consultationFee || 0,
        availability: doctor.doctorDetails.availability || [],
        about: doctor.doctorDetails.about || '',
        rating: doctor.doctorDetails.rating || 0,
        totalReviews: doctor.doctorDetails.totalReviews || 0,
        expertise: {
          conditions: doctor.doctorDetails.expertise?.conditions || [],
          treatments: doctor.doctorDetails.expertise?.treatments || []
        }
      };
    } else {
      processedDoctor.doctorDetails = {
        specialization: '',
        experience: 0,
        qualifications: [],
        clinicName: '',
        clinicAddress: '',
        clinicImages: [],
        consultationFee: 0,
        availability: [],
        about: '',
        rating: 0,
        totalReviews: 0,
        expertise: {
          conditions: [],
          treatments: []
        }
      };
    }

    // Add location if it exists
    if (doctor.location) {
      processedDoctor.location = doctor.location;
    }

    console.log('Processed data:', JSON.stringify(processedDoctor, null, 2));

    // Return the processed data
    res.status(200).json({
      success: true,
      doctor: processedDoctor
    });
  } catch (error) {
    console.error('Error in getDoctorByIdComplete:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET /api/admin/doctors/new/specialization/:specialization - Get doctors by specialization
exports.getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    
    console.log(`Fetching doctors with specialization: ${specialization}`);

    // Fetch doctors with the specified specialization
    const doctors = await User.find({ 
      role: 'doctor',
      'doctorDetails.specialization': { $regex: specialization, $options: 'i' }
    }).lean();

    console.log(`Found ${doctors.length} doctors with specialization: ${specialization}`);

    // Process each doctor to ensure all fields are included
    const processedDoctors = doctors.map(doctor => {
      // Create a new object with all fields from the doctor document
      const processedDoctor = {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role,
        isActive: doctor.isActive !== undefined ? doctor.isActive : true,
        profileImage: doctor.profileImage || '',
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt
      };

      // Add profile information
      if (doctor.profile) {
        processedDoctor.profile = {
          age: doctor.profile.age || 0,
          gender: doctor.profile.gender || '',
          phone: doctor.profile.phone || '',
          address: doctor.profile.address || '',
          bloodGroup: doctor.profile.bloodGroup || '',
          emergencyContact: doctor.profile.emergencyContact || ''
        };
      } else {
        processedDoctor.profile = {
          age: 0,
          gender: '',
          phone: '',
          address: '',
          bloodGroup: '',
          emergencyContact: ''
        };
      }

      // Add doctor details
      if (doctor.doctorDetails) {
        processedDoctor.doctorDetails = {
          specialization: doctor.doctorDetails.specialization || '',
          experience: doctor.doctorDetails.experience || 0,
          qualifications: doctor.doctorDetails.qualifications || [],
          clinicName: doctor.doctorDetails.clinicName || '',
          clinicAddress: doctor.doctorDetails.clinicAddress || '',
          clinicImages: doctor.doctorDetails.clinicImages || [],
          consultationFee: doctor.doctorDetails.consultationFee || 0,
          availability: doctor.doctorDetails.availability || [],
          about: doctor.doctorDetails.about || '',
          rating: doctor.doctorDetails.rating || 0,
          totalReviews: doctor.doctorDetails.totalReviews || 0,
          expertise: {
            conditions: doctor.doctorDetails.expertise?.conditions || [],
            treatments: doctor.doctorDetails.expertise?.treatments || []
          }
        };
      } else {
        processedDoctor.doctorDetails = {
          specialization: '',
          experience: 0,
          qualifications: [],
          clinicName: '',
          clinicAddress: '',
          clinicImages: [],
          consultationFee: 0,
          availability: [],
          about: '',
          rating: 0,
          totalReviews: 0,
          expertise: {
            conditions: [],
            treatments: []
          }
        };
      }

      // Add location if it exists
      if (doctor.location) {
        processedDoctor.location = doctor.location;
      }

      return processedDoctor;
    });

    // Return the processed data
    res.status(200).json({
      success: true,
      count: processedDoctors.length,
      specialization: specialization,
      doctors: processedDoctors
    });
  } catch (error) {
    console.error('Error in getDoctorsBySpecialization:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// PATCH /api/admin/doctors/new/:id/toggle-active - Toggle doctor active status
exports.toggleDoctorActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Toggling active status for doctor ID: ${id}`);

    // Find the doctor by ID
    const doctor = await User.findOne({ _id: id, role: 'doctor' });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Toggle the isActive status
    doctor.isActive = !doctor.isActive;
    await doctor.save();

    console.log(`Doctor ${doctor.name} is now ${doctor.isActive ? 'active' : 'inactive'}`);

    res.status(200).json({
      success: true,
      message: `Doctor ${doctor.isActive ? 'activated' : 'deactivated'} successfully`,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        isActive: doctor.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling doctor active status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
