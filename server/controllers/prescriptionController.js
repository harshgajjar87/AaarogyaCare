const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const transporter = require('../config/mail');

// Mark patient as visited
exports.markPatientVisited = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Check if doctor is authorized
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    appointment.status = 'visited';
    await appointment.save();

    res.json({ msg: 'Patient marked as visited', appointment });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Create prescription
exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, diagnosis, notes, medicines, followUpDate, instructions } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate('patientId');
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Check if doctor is authorized
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const prescription = new Prescription({
      appointmentId,
      patientId: appointment.patientId._id,
      doctorId: req.user._id,
      diagnosis,
      notes,
      medicines,
      followUpDate,
      instructions
    });

    await prescription.save();

    // Update appointment status to completed
    appointment.status = 'completed';
    await appointment.save();

    // Send prescription email to patient
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      try {
        const medicineList = medicines.map(med => {
          const frequency = [];
          if (med.frequency.morning) frequency.push('Morning');
          if (med.frequency.evening) frequency.push('Evening');
          if (med.frequency.night) frequency.push('Night');
          
          return `• ${med.name} - ${med.dosage} (${frequency.join(', ')}) ${med.timing.replace('_', ' ')} for ${med.days} days`;
        }).join('\n');

        const mailOptions = {
          from: process.env.MAIL_USER,
          to: appointment.patientId.email,
          subject: 'Your Prescription - AarogyaCare',
          html: `
            <h2>Prescription from Dr. ${req.user.name}</h2>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Patient:</strong> ${appointment.patientId.name}</p>
            
            <h3>Diagnosis:</h3>
            <p>${diagnosis}</p>
            
            ${notes ? `<h3>Notes:</h3><p>${notes}</p>` : ''}
            
            <h3>Medicines:</h3>
            <pre>${medicineList}</pre>
            
            ${instructions ? `<h3>Instructions:</h3><p>${instructions}</p>` : ''}
            
            ${followUpDate ? `<p><strong>Follow-up Date:</strong> ${new Date(followUpDate).toLocaleDateString()}</p>` : ''}
            
            <p>Thank you for choosing AarogyaCare!</p>
          `
        };
        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error('Failed to send prescription email:', emailErr);
      }
    }

    res.json({ msg: 'Prescription created successfully', prescription });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get patient prescriptions
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.user._id })
      .populate('doctorId', 'name')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get doctor prescriptions
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctorId: req.user._id })
      .populate('patientId', 'name')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get patient details for doctor
exports.getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Get patient info
    const patient = await User.findById(patientId).select('-password');
    if (!patient) {
      return res.status(404).json({ msg: 'Patient not found' });
    }

    // Get all appointments for this patient with this doctor
    const appointments = await Appointment.find({ 
      patientId, 
      doctorId: req.user._id 
    }).sort({ createdAt: -1 });

    // Get all prescriptions for this patient from this doctor
    const prescriptions = await Prescription.find({ 
      patientId, 
      doctorId: req.user._id 
    }).populate('appointmentId', 'date time').sort({ createdAt: -1 });

    res.json({
      patient,
      appointments,
      prescriptions,
      totalAppointments: appointments.length
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = exports;