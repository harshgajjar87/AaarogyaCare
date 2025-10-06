const ImageUpload = require('../models/ImageUpload');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Complete image upload function
const completeImageUpload = async (req, res) => {
  try {
    // Validate file exists
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Validate file size (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        message: 'File size exceeds 5MB limit' 
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid file type. Only images and PDF files are allowed' 
      });
    }

    // Create upload record
    const uploadRecord = new ImageUpload({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/images/${req.file.filename}`,
      uploadedBy: req.user.id,
      size: req.file.size,
      mimetype: req.file.mimetype,
      type: req.body.type || 'general'
    });

    await uploadRecord.save();

    // Update user's profile image if type is profile
    if (req.body.type === 'profile') {
      const user = await User.findById(req.user.id);
      if (user) {
        user.profileImage = `/uploads/images/${req.file.filename}`;
        await user.save();
      }
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        id: uploadRecord._id,
        url: `/uploads/images/${req.file.filename}`,
        filename: req.file.filename,
        originalName: req.file.originalname
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Upload failed' 
    });
  }
};

// Multiple image upload
const completeMultipleUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
    }

    const uploadPromises = req.files.map(file => {
      const uploadRecord = new ImageUpload({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/images/${file.filename}`,
        uploadedBy: req.user.id,
        size: file.size,
        mimetype: file.mimetype,
        type: req.body.type || 'general'
      });
      return uploadRecord.save();
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: `${uploadedFiles.length} images uploaded successfully`,
      data: uploadedFiles.map(file => ({
        id: file._id,
        url: file.path,
        filename: file.filename,
        originalName: file.originalName
      }))
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Upload failed' 
    });
  }
};

// Get uploaded images
const getUploadedImages = async (req, res) => {
  try {
    const images = await ImageUpload.find({ uploadedBy: req.user.id })
      .sort({ uploadedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete uploaded image
const deleteUploadedImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const image = await ImageUpload.findOne({ 
      _id: imageId, 
      uploadedBy: req.user.id 
    });

    if (!image) {
      return res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '..', image.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await ImageUpload.findByIdAndDelete(imageId);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  completeImageUpload,
  completeMultipleUpload,
  getUploadedImages,
  deleteUploadedImage
};
