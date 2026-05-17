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
    if (process.env.MAIL_USER && process.env.MAILJET_API_KEY) {
      try {
        const doctor = await User.findById(req.user._id).select('name');
        const medicineRows = medicines.map(med => {
          const freq = [];
          if (med.frequency.morning) freq.push('Morning');
          if (med.frequency.evening) freq.push('Evening');
          if (med.frequency.night) freq.push('Night');
          return `
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px 12px;font-weight:600;color:#111827;">${med.name}</td>
              <td style="padding:10px 12px;color:#374151;">${med.dosage}</td>
              <td style="padding:10px 12px;color:#374151;">${freq.join(', ')}</td>
              <td style="padding:10px 12px;color:#374151;">${med.timing.replace('_', ' ')}</td>
              <td style="padding:10px 12px;color:#374151;">${med.days} day${med.days > 1 ? 's' : ''}</td>
            </tr>`;
        }).join('');

        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: appointment.patientId.email,
          subject: 'Your Prescription - AarogyaCare',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#14b8a6,#0d9488);padding:30px;text-align:center;border-radius:10px 10px 0 0;">
                <h1 style="color:white;margin:0;">🏥 AarogyaCare</h1>
                <p style="color:#e0f2fe;margin:8px 0 0;">Prescription from ${doctor.name}</p>
              </div>
              <div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px;">
                <p>Dear <strong>${appointment.patientId.name}</strong>,</p>
                <p>Your doctor has issued a prescription for you. Please find the details below.</p>

                <div style="background:white;border-left:4px solid #14b8a6;padding:16px 20px;border-radius:6px;margin:16px 0;">
                  <p style="margin:0 0 6px;"><strong style="color:#14b8a6;">Diagnosis:</strong> ${diagnosis}</p>
                  ${notes ? `<p style="margin:6px 0;"><strong style="color:#14b8a6;">Clinical Notes:</strong> ${notes}</p>` : ''}
                  ${instructions ? `<p style="margin:6px 0;"><strong style="color:#14b8a6;">Instructions:</strong> ${instructions}</p>` : ''}
                  ${followUpDate ? `<p style="margin:6px 0;"><strong style="color:#14b8a6;">Follow-up Date:</strong> ${new Date(followUpDate).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</p>` : ''}
                </div>

                <h3 style="color:#14b8a6;margin-bottom:8px;">💊 Medicines</h3>
                <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
                  <thead>
                    <tr style="background:#f0fdfa;">
                      <th style="padding:10px 12px;text-align:left;color:#14b8a6;font-size:13px;">Medicine</th>
                      <th style="padding:10px 12px;text-align:left;color:#14b8a6;font-size:13px;">Dosage</th>
                      <th style="padding:10px 12px;text-align:left;color:#14b8a6;font-size:13px;">Frequency</th>
                      <th style="padding:10px 12px;text-align:left;color:#14b8a6;font-size:13px;">Timing</th>
                      <th style="padding:10px 12px;text-align:left;color:#14b8a6;font-size:13px;">Duration</th>
                    </tr>
                  </thead>
                  <tbody>${medicineRows}</tbody>
                </table>

                <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:14px 18px;border-radius:6px;margin:20px 0;">
                  <strong style="color:#1d4ed8;">📌 Reminder:</strong>
                  <p style="margin:6px 0 0;color:#1e40af;font-size:14px;">Take medicines as prescribed. Do not stop without consulting your doctor. You can view and download this prescription from your patient dashboard.</p>
                </div>

                <p style="color:#6b7280;font-size:12px;margin-top:24px;text-align:center;">© ${new Date().getFullYear()} AarogyaCare. All rights reserved.</p>
              </div>
            </div>
          `
        });
        console.log('✅ Prescription email sent to patient:', appointment.patientId.email);
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
    if (process.env.MAIL_USER && process.env.MAILJET_API_KEY) {
      try {
        const medicineRows = medicines.map(med => {
          const freq = [];
          if (med.frequency.morning) freq.push('Morning');
          if (med.frequency.evening) freq.push('Evening');
          if (med.frequency.night) freq.push('Night');
          return `
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px 12px;font-weight:600;color:#111827;">${med.name}</td>
              <td style="padding:10px 12px;color:#374151;">${med.dosage}</td>
              <td style="padding:10px 12px;color:#374151;">${freq.join(', ')}</td>
              <td style="padding:10px 12px;color:#374151;">${med.timing.replace('_', ' ')}</td>
              <td style="padding:10px 12px;color:#374151;">${med.days} day${med.days > 1 ? 's' : ''}</td>
            </tr>`;
        }).join('');

        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: patient.email,
          subject: 'New Prescription - AarogyaCare',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#14b8a6,#0d9488);padding:30px;text-align:center;border-radius:10px 10px 0 0;">
                <h1 style="color:white;margin:0;">🏥 AarogyaCare</h1>
                <p style="color:#e0f2fe;margin:8px 0 0;">Prescription from Dr. ${req.user.name}</p>
              </div>
              <div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px;">
                <p>Dear <strong>${patient.name}</strong>,</p>
                <p>Your doctor has issued a prescription for you.</p>
                <div style="background:white;border-left:4px solid #14b8a6;padding:16px 20px;border-radius:6px;margin:16px 0;">
                  <p style="margin:0 0 6px;"><strong style="color:#14b8a6;">Diagnosis:</strong> ${diagnosis}</p>
                  ${notes ? `<p style="margin:6px 0;"><strong style="color:#14b8a6;">Notes:</strong> ${notes}</p>` : ''}
                  ${instructions ? `<p style="margin:6px 0;"><strong style="color:#14b8a6;">Instructions:</strong> ${instructions}</p>` : ''}
                  ${followUpDate ? `<p style="margin:6px 0;"><strong style="color:#14b8a6;">Follow-up:</strong> ${new Date(followUpDate).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</p>` : ''}
                </div>
                <h3 style="color:#14b8a6;">💊 Medicines</h3>
                <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
                  <thead>
                    <tr style="background:#f0fdfa;">
                      <th style="padding:10px 12px;text-align:left;color:#14b8a6;font-size:13px;">Medicine</th>
                      <th style="padding:10px 12px;text-align:left;color:#14b8a6;font-size:13px;">Dosage</th>
                      <th style="padding:10px 12px;text-align:left;color:#14b8a6;font-size:13px;">Frequency</th>
                      <th style="padding:10px 12px;text-align:left;color:#14b8a6;font-size:13px;">Timing</th>
                      <th style="padding:10px 12px;text-align:left;color:#14b8a6;font-size:13px;">Duration</th>
                    </tr>
                  </thead>
                  <tbody>${medicineRows}</tbody>
                </table>
                <p style="color:#6b7280;font-size:12px;margin-top:24px;text-align:center;">© ${new Date().getFullYear()} AarogyaCare. All rights reserved.</p>
              </div>
            </div>
          `
        });
        console.log('✅ Prescription email sent to patient:', patient.email);
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