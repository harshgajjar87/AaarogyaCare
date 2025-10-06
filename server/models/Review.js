const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer between 1 and 5'
    }
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false
  },
  patientName: {
    type: String,
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
reviewSchema.index({ doctorId: 1, createdAt: -1 });
reviewSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

// Static method to calculate average rating for a doctor
reviewSchema.statics.calculateAverageRating = async function(doctorId) {
  const result = await this.aggregate([
    {
      $match: { doctorId: doctorId }
    },
    {
      $group: {
        _id: '$doctorId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    const User = mongoose.model('User');
    if (result.length > 0) {
      await User.findByIdAndUpdate(doctorId, {
        'doctorDetails.rating': parseFloat(result[0].averageRating.toFixed(1)),
        'doctorDetails.totalReviews': result[0].totalReviews
      });
    } else {
      await User.findByIdAndUpdate(doctorId, {
        'doctorDetails.rating': 0,
        'doctorDetails.totalReviews': 0
      });
    }
  } catch (error) {
    console.error('Error updating doctor rating:', error);
  }
};

// Update doctor rating after saving a review
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.doctorId);
});

// Update doctor rating after removing a review
reviewSchema.post('remove', function() {
  this.constructor.calculateAverageRating(this.doctorId);
});

module.exports = mongoose.model('Review', reviewSchema);
