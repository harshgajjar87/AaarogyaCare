const mongoose = require('mongoose');

const doctorVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  idProof: {
    type: String, // File path for ID proof document
    required: true
  },
  license: {
    type: String, // File path for medical license document
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Index for efficient queries
doctorVerificationSchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('DoctorVerification', doctorVerificationSchema);
