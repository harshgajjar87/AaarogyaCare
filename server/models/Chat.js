
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
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
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  endedByDoctor: {
    type: Boolean,
    default: false
  },
  expiresAt: { 
    type: Date, 
    required: true,
    default: function() {
      // Set default to 5 days from now
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 5);
      return expirationDate;
    }
  },
  messages: [{
    senderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { timestamps: true });

// Set up a pre-save hook to automatically set expiration date to 5 days from now
chatSchema.pre('save', function(next) {
  // Always set expiresAt to 5 days from now for new documents
  if (this.isNew && !this.expiresAt) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 5); // Add 5 days
    this.expiresAt = expirationDate;
  }
  next();
});

// Index for efficient querying
chatSchema.index({ appointmentId: 1, isActive: 1 });
chatSchema.index({ patientId: 1, doctorId: 1 });

// Add unique compound index to prevent duplicate chats for the same appointment
chatSchema.index({ appointmentId: 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema);
