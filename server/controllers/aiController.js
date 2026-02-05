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

module.exports = {
    getSpecialist,
    getHealthRisk,
};