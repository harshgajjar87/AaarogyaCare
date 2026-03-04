const axios = require('axios');

const generalPrediction = async (req, res) => {
  try {
    const { age, gender, height, weight, bmi, bloodPressureSystolic, bloodPressureDiastolic, 
            bloodSugar, cholesterol, smokingStatus, alcoholConsumption, exerciseFrequency, 
            sleepHours, familyHistory, chronicConditions } = req.body;

    const prompt = `You are a medical AI assistant. Analyze the following patient health data and provide a comprehensive health prediction:

Age: ${age}
Gender: ${gender}
Height: ${height} cm
Weight: ${weight} kg
BMI: ${bmi}
Blood Pressure: ${bloodPressureSystolic}/${bloodPressureDiastolic} mmHg
Blood Sugar: ${bloodSugar} mg/dL
Cholesterol: ${cholesterol} mg/dL
Smoking: ${smokingStatus}
Alcohol: ${alcoholConsumption}
Exercise: ${exerciseFrequency}
Sleep: ${sleepHours} hours
Family History: ${familyHistory}
Chronic Conditions: ${chronicConditions}

Provide a JSON response with:
1. healthScore (0-100)
2. riskFactors (array of identified risks)
3. potentialConditions (array of health concerns to monitor)
4. recommendations (array of actionable health suggestions)

Format as valid JSON only, no markdown.`;

    // Use Groq API
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a medical AI assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const text = response.data.choices[0].message.content;
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
    } catch {
      parsedResponse = {
        healthScore: 75,
        riskFactors: ['Unable to parse detailed analysis'],
        potentialConditions: ['Please consult a healthcare provider'],
        recommendations: ['Regular health checkups recommended']
      };
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Error generating prediction:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    res.status(500).json({ 
      message: 'Error generating health prediction',
      error: error.message,
      details: error.response?.data || error.message
    });
  }
};

const analyzeReport = async (req, res) => {
  try {
    const { reportType, reportData } = req.body;

    console.log('Received analyze-report request:', { reportType, hasData: !!reportData });

    if (!reportType || !reportData) {
      return res.status(400).json({ message: 'Report type and data are required' });
    }

    const prompt = `You are a medical AI assistant helping patients understand their ${reportType}. 

Report Data:
${reportData}

Analyze this medical report and provide a comprehensive, easy-to-understand explanation in JSON format:

1. summary: Brief overview of the report
2. parameters: Array of objects with {name, value, status (normal/borderline/abnormal), explanation, normalRange}
3. goodPoints: Array of positive findings
4. concerns: Array of concerning findings
5. recommendations: Array of actionable suggestions
6. disclaimer: Reminder to consult healthcare provider

Make it simple for someone with no medical knowledge. Format as valid JSON only, no markdown.`;

    console.log('Using Groq API...');
    
    // Use Groq API
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a medical AI assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const text = response.data.choices[0].message.content;
    console.log('Groq API succeeded');
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', text);
      parsedResponse = {
        summary: 'Report analysis completed',
        parameters: [],
        goodPoints: ['Report received successfully'],
        concerns: [],
        recommendations: ['Consult with your healthcare provider for detailed interpretation'],
        disclaimer: 'This is an AI-generated analysis. Please consult your doctor for medical advice.'
      };
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Error analyzing report:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    res.status(500).json({ 
      message: 'Error analyzing report',
      error: error.message,
      details: error.response?.data || (process.env.NODE_ENV === 'development' ? error.stack : undefined)
    });
  }
};

module.exports = {
  generalPrediction,
  analyzeReport
};
