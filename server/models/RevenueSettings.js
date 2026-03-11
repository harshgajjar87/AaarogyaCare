const mongoose = require('mongoose');

const revenueSettingsSchema = new mongoose.Schema({
  // Platform Commission
  platformCommissionPercentage: {
    type: Number,
    required: true,
    default: 10, // 10% platform commission
    min: 0,
    max: 100
  },
  
  // GST Configuration
  gstPercentage: {
    type: Number,
    required: true,
    default: 18, // 18% GST in India
    min: 0,
    max: 100
  },
  
  // GST is applied on platform commission or total amount
  gstAppliedOn: {
    type: String,
    enum: ['commission', 'total', 'none'],
    default: 'commission' // GST on platform commission only
  },
  
  // Payment Gateway Charges
  paymentGatewayPercentage: {
    type: Number,
    default: 2, // 2% Razorpay charges
    min: 0,
    max: 10
  },
  
  paymentGatewayFixedCharge: {
    type: Number,
    default: 0, // Fixed charge per transaction
    min: 0
  },
  
  // Minimum transaction amount
  minimumTransactionAmount: {
    type: Number,
    default: 100,
    min: 0
  },
  
  // Active status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Effective date
  effectiveFrom: {
    type: Date,
    default: Date.now
  },
  
  // Notes
  notes: {
    type: String
  }
}, { timestamps: true });

// Ensure only one active settings document
revenueSettingsSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

module.exports = mongoose.model('RevenueSettings', revenueSettingsSchema);
