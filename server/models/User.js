const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'pending_doctor', 'doctor', 'admin'], default: 'patient' },
  isActive: { type: Boolean, default: true }, // New field for active/inactive status
  profileImage: { type: String, default: '' },
  profile: {
    age: { type: Number, min: 0, max: 120 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    phone: { type: String },
    address: { type: String },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    emergencyContact: { type: String }
  },
  // Doctor-specific fields
  doctorDetails: {
    specialization: { type: String },
    experience: { type: Number, min: 0 },
    qualifications: [{ type: String }],
    clinicName: { type: String },
    clinicAddress: { type: String },
    clinicImages: [{ type: String }],
    consultationFee: { type: Number, min: 0 },
    availability: [{
      day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      startTime: { type: String },
      endTime: { type: String }
    }],
    about: { type: String },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    totalReviews: { type: Number, default: 0 },
    expertise: {
      conditions: [{ type: String }],
      treatments: [{ type: String }]
    }
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  }
}, { timestamps: true });

// Create geospatial index for location-based queries
userSchema.index({ location: '2dsphere' });

// Add pre-save hook to ensure doctorDetails is initialized
userSchema.pre('save', function(next) {
  // If user is a doctor but doesn't have doctorDetails, initialize it
  if (this.role === 'doctor' && !this.doctorDetails) {
    this.doctorDetails = {
      specialization: '',
      experience: 0,
      qualifications: [],
      clinicName: '',
      clinicAddress: '',
      clinicImages: [],
      consultationFee: 0,
      availability: [],
      about: '',
      rating: 0,
      totalReviews: 0,
      expertise: {
        conditions: [],
        treatments: []
      }
    };
    console.log('Initialized doctorDetails for user:', this._id);
  }
  
  // Ensure clinicImages array exists
  if (this.role === 'doctor' && this.doctorDetails && !Array.isArray(this.doctorDetails.clinicImages)) {
    this.doctorDetails.clinicImages = [];
    console.log('Initialized clinicImages array for user:', this._id);
  }
  
  next();
});

module.exports = mongoose.model('User', userSchema);
