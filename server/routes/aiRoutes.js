
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/specialist', aiController.getSpecialist);
router.post('/assess-risk', aiController.getHealthRisk);
router.post('/health-prediction', aiController.getHealthPrediction);

module.exports = router;
