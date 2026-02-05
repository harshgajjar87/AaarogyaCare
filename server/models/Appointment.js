const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // ⏰ e.g. "11:00"
  reason: { type: String },
  fees: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'cancelled-by-patient', 'paid', 'completed', 'visited'],
    default: 'pending'
  },
  paymentInfo: {
    paymentId: { type: String },
    orderId: { type: String },
    signature: { type: String },
    amount: { type: Number },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' }
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
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
