const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g., "1 tablet"
  frequency: {
    morning: { type: Boolean, default: false },
    evening: { type: Boolean, default: false },
    night: { type: Boolean, default: false }
  },
  timing: { type: String, enum: ['before_meal', 'after_meal'], required: true },
  days: { type: Number, required: true }
});

const prescriptionSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosis: { type: String, required: true },
  notes: { type: String },
  medicines: [medicineSchema],
  followUpDate: { type: Date },
  instructions: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);