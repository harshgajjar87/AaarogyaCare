const express = require('express');
const router = express.Router();
const imageUploadController = require('../controllers/imageUploadController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Corrected Path: Relative to your project root
    const uploadDir = 'uploads/images'; // <-- REMOVE 'server/'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Routes
router.post('/upload', protect, upload.single('image'), imageUploadController.completeImageUpload);
router.post('/upload-multiple', protect, upload.array('images', 10), imageUploadController.completeMultipleUpload);
router.get('/my-images', protect, imageUploadController.getUploadedImages);
router.delete('/delete/:imageId', protect, imageUploadController.deleteUploadedImage);

module.exports = router;
