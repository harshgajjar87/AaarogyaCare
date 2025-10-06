const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // optional
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // ⏰ e.g. "11:00"
  reason: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected','cancelled-by-patient'],
    default: 'pending'
  },
  chatEnabled: {
    type: Boolean,
    default: false
  },
  chatCreatedAt: {
    type: Date
  },
  chatExpiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
