const axios = require('axios');

// Get the URL from the .env file
const PYTHON_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

const getSpecialist = async (req, res) => {
    try {
        const { symptoms } = req.body;
        // Use the variable instead of hardcoded string
        const response = await axios.post(`${PYTHON_URL}/predict-specialist`, { symptoms });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching specialist recommendation:', error.message);
        res.status(500).json({ message: 'Error fetching specialist recommendation' });
    }
};

const getHealthRisk = async (req, res) => {
    try {
        const { age, bmi, bp } = req.body;
        const response = await axios.post(`${PYTHON_URL}/predict-risk`, { age, bmi, bp });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching health risk assessment:', error.message);
        res.status(500).json({ message: 'Error fetching health risk assessment' });
    }
};

const getHealthPrediction = async (req, res) => {
    try {
        const healthData = req.body;
        // For now, generate a mock prediction since we don't have the Python service
        // In production, this would call the Python ML service
        const mockPrediction = {
            healthScore: Math.floor(Math.random() * 40) + 60, // 60-100
            riskFactors: [],
            recommendations: [],
            potentialConditions: []
        };

        // Add risk factors based on data
        if (healthData.age > 50) mockPrediction.riskFactors.push('Age-related health risks');
        if (healthData.smokingStatus === 'current') mockPrediction.riskFactors.push('Smoking habit');
        if (healthData.bmi > 30) mockPrediction.riskFactors.push('Obesity');
        if (healthData.exerciseFrequency === 'none') mockPrediction.riskFactors.push('Sedentary lifestyle');

        // Add recommendations
        if (healthData.exerciseFrequency === 'none') mockPrediction.recommendations.push('Increase physical activity');
        if (healthData.smokingStatus === 'current') mockPrediction.recommendations.push('Consider smoking cessation');
        if (healthData.sleepHours < 7) mockPrediction.recommendations.push('Improve sleep hygiene');
        mockPrediction.recommendations.push('Regular health checkups');
        mockPrediction.recommendations.push('Maintain balanced diet');

        // Add potential conditions based on risk factors
        if (healthData.bmi > 30) mockPrediction.potentialConditions.push('Type 2 Diabetes risk');
        if (healthData.smokingStatus === 'current') mockPrediction.potentialConditions.push('Cardiovascular disease risk');
        if (healthData.age > 60) mockPrediction.potentialConditions.push('Hypertension monitoring needed');

        res.json(mockPrediction);
    } catch (error) {
        console.error('Error generating health prediction:', error.message);
        res.status(500).json({ message: 'Error generating health prediction' });
    }
};

module.exports = {
    getSpecialist,
    getHealthRisk,
    getHealthPrediction,
};