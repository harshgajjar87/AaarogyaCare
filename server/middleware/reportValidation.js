const Appointment = require('../models/Appointment');

// Middleware to validate if doctor has had appointments with patient
exports.validateDoctorPatientRelationship = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user._id;

    // Check if doctor has had any approved appointments with this patient
    const appointments = await Appointment.find({
      doctorId,
      patientId,
      status: 'approved'
    });

    if (appointments.length === 0) {
      return res.status(403).json({ 
        msg: 'You can only upload reports for patients you have had appointments with' 
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ msg: 'Validation error', error: err.message });
  }
};

// Helper function to get patients with appointments for a doctor
exports.getDoctorPatients = async (doctorId) => {
  try {
    const appointments = await Appointment.find({
      doctorId,
      status: 'approved'
    }).populate('patientId', 'name email profile');

    // Get unique patients
    const patients = [];
    const patientIds = new Set();
    
    appointments.forEach(appointment => {
      if (!patientIds.has(appointment.patientId._id.toString())) {
        patients.push(appointment.patientId);
        patientIds.add(appointment.patientId._id.toString());
      }
    });

    return patients;
  } catch (err) {
    throw new Error('Error fetching doctor patients');
  }
};
