const express = require('express');
const router = express.Router();
const healthPredictionController = require('../controllers/healthPredictionController');

router.post('/general-prediction', healthPredictionController.generalPrediction);
router.post('/analyze-report', healthPredictionController.analyzeReport);

module.exports = router;
