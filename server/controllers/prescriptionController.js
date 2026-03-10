const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const transporter = require('../config/mail');
const { generatePrescriptionPDF } = require('../utils/pdfGenerator');
const path = require('path');

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

// Create direct prescription (without appointment)
exports.createDirectPrescription = async (req, res) => {
  try {
    const { patientId, diagnosis, notes, medicines, followUpDate, instructions } = req.body;

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ msg: 'Patient not found' });
    }

    const prescription = new Prescription({
      patientId,
      doctorId: req.user._id,
      diagnosis,
      notes,
      medicines,
      followUpDate,
      instructions
      // appointmentId is optional for direct prescriptions
    });

    await prescription.save();

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
          to: patient.email,
          subject: 'New Prescription - AarogyaCare',
          html: `
            <h2>Prescription from Dr. ${req.user.name}</h2>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Patient:</strong> ${patient.name}</p>
            
            <h3>Diagnosis:</h3>
            <p>${diagnosis}</p>
            
            ${notes ? `<h3>Notes:</h3><p>${notes}</p>` : ''}
            
            <h3>Medicines:</h3>
            <pre>${medicineList}</pre>
            
            ${instructions ? `<h3>Instructions:</h3><p>${instructions}</p>` : ''}
            
            ${followUpDate ? `<p><strong>Follow-up Date:</strong> ${new Date(followUpDate).toLocaleDateString()}</p>` : ''}
            
            <p>You can view and download this prescription from your dashboard.</p>
            <p>Thank you for choosing AarogyaCare!</p>
          `
        };
        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error('Failed to send prescription email:', emailErr);
      }
    }

    res.json({ msg: 'Prescription created and sent to patient successfully', prescription });
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

// Download prescription as PDF
exports.downloadPrescriptionPDF = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name email profile')
      .populate('doctorId', 'name profile doctorDetails');

    if (!prescription) {
      return res.status(404).json({ msg: 'Prescription not found' });
    }

    // Check authorization - allow both patient and doctor
    const isPatient = prescription.patientId._id.toString() === req.user._id.toString();
    const isDoctor = prescription.doctorId._id.toString() === req.user._id.toString();
    
    if (!isPatient && !isDoctor) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const fileName = await generatePrescriptionPDF(prescription, prescription.patientId, prescription.doctorId);
    const filePath = path.join(__dirname, '../uploads', fileName);

    res.download(filePath, `Prescription_${prescription.patientId.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Delete file after download
      setTimeout(() => {
        try {
          require('fs').unlinkSync(filePath);
        } catch (e) {}
      }, 1000);
    });
  } catch (err) {
    console.error('PDF download error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = exports;