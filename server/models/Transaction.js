const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Reference
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payment Details
  razorpayPaymentId: {
    type: String,
    required: true
  },
  
  razorpayOrderId: {
    type: String,
    required: true
  },
  
  razorpaySignature: {
    type: String,
    required: true
  },
  
  // Amount Breakdown
  totalAmount: {
    type: Number,
    required: true // Total amount paid by patient
  },
  
  doctorFees: {
    type: Number,
    required: true // Original doctor consultation fees
  },
  
  platformCommission: {
    type: Number,
    required: true // Platform commission amount
  },
  
  platformCommissionPercentage: {
    type: Number,
    required: true // Percentage used for calculation
  },
  
  gstAmount: {
    type: Number,
    required: true // GST amount
  },
  
  gstPercentage: {
    type: Number,
    required: true // GST percentage used
  },
  
  paymentGatewayCharges: {
    type: Number,
    required: true // Razorpay/payment gateway charges
  },
  
  doctorPayout: {
    type: Number,
    required: true // Final amount to be paid to doctor
  },
  
  platformRevenue: {
    type: Number,
    required: true // Net revenue for platform (commission - gateway charges)
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'settled'],
    default: 'completed'
  },
  
  // Payout Status
  doctorPayoutStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  doctorPayoutDate: {
    type: Date
  },
  
  doctorPayoutReference: {
    type: String // Bank transfer reference or UPI transaction ID
  },
  
  // Settlement Details
  settlementDate: {
    type: Date
  },
  
  settlementBatch: {
    type: String // Batch ID for bulk settlements
  },
  
  // Refund Details
  refundAmount: {
    type: Number,
    default: 0
  },
  
  refundDate: {
    type: Date
  },
  
  refundReason: {
    type: String
  },
  
  refundReference: {
    type: String
  },
  
  // Notes
  notes: {
    type: String
  }
}, { timestamps: true });

// Indexes for efficient queries
transactionSchema.index({ appointmentId: 1 });
transactionSchema.index({ patientId: 1 });
transactionSchema.index({ doctorId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ doctorPayoutStatus: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
