const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const healthPredictionController = require('../controllers/healthPredictionController');

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'report-' + unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG, and PDF are allowed'));
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/general-prediction', healthPredictionController.generalPrediction);
router.post('/analyze-report', healthPredictionController.analyzeReport);
router.post('/analyze-report-with-file', upload.single('file'), healthPredictionController.analyzeReportWithFile);

module.exports = router;
