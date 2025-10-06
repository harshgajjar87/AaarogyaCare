const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  file: { type: String, required: true }, // PDF file path
  title: String,
  reason: String, // ✅ NEW: Reason for report
  date: Date,     // ✅ NEW: Medical date of report
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);
