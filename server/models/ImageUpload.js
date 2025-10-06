const mongoose = require('mongoose');

const ImageUploadSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['profile', 'clinic', 'report', 'general'],
    default: 'general'
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  }
});

// Index for faster queries
ImageUploadSchema.index({ uploadedBy: 1, uploadedAt: -1 });

module.exports = mongoose.model('ImageUpload', ImageUploadSchema);
