const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for clinic images
const clinicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use path.join to ensure correct path resolution
    const uploadDir = path.join(__dirname, '..', 'uploads', 'clinic-images');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const cleanFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, 'clinic-' + uniqueSuffix + path.extname(cleanFilename));
  }
});

// File filter for clinic images
const clinicFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed for clinic images'), false);
  }
};

// Create multer upload instance with error handling
const clinicUpload = multer({
  storage: clinicStorage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: clinicFileFilter
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum 5MB allowed.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum 5 images allowed.' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = { clinicUpload, handleMulterError };
