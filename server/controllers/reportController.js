const Report = require('../models/Report');
const User = require('../models/User');
const transporter = require('../config/mail');

// ✅ Upload Report (Doctor to Patient)
exports.uploadReport = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user._id;

    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const newReport = new Report({
      patientId,
      doctorId,
      file: req.file.filename,
      title: req.body.title || 'Medical Report',
      reason: req.body.reason || 'Not specified', // ✅ Added
      date: req.body.date || new Date()           // ✅ Added
    });

    await newReport.save();

    const patient = await User.findById(patientId);

    // Email notification with download link
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: patient.email,
      subject: 'New Medical Report Uploaded',
      html: `
        <p>Dear ${patient.name},</p>
        <p>Your doctor has uploaded a new report titled: <strong>${newReport.title}</strong></p>
        <p>You can <a href="${process.env.BASE_URL}/uploads/${req.file.filename}">download it here</a>.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: 'Report uploaded and patient notified', report: newReport });
  } catch (err) {
    res.status(500).json({ msg: 'Upload failed', error: err.message });
  }
};


// ✅ Get Reports for Logged-in Patient
exports.getPatientReports = async (req, res) => {
  try {
    const reports = await Report.find({ patientId: req.user._id })
      .populate('doctorId', 'name email')
      .sort({ uploadedAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching reports', error: err.message });
  }
};

// ✅ Get All Reports (for Doctor Dashboard)
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ uploadedAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching all reports', error: err.message });
  }
};
