const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/health';

async function testGeneralPrediction() {
  console.log('\n=== Testing General Prediction Endpoint ===\n');
  
  const testData = {
    age: 35,
    gender: 'Male',
    height: 175,
    weight: 75,
    bmi: 24.5,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    bloodSugar: 95,
    cholesterol: 180,
    smokingStatus: 'Non-smoker',
    alcoholConsumption: 'Occasional',
    exerciseFrequency: '3-4 times per week',
    sleepHours: 7,
    familyHistory: 'No significant history',
    chronicConditions: 'None'
  };

  try {
    console.log('Sending request to:', `${BASE_URL}/general-prediction`);
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/general-prediction`, testData);
    
    console.log('\n✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('\n❌ ERROR!');
    console.log('Status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message || error.message);
    console.log('Error details:', error.response?.data?.error);
    if (error.response?.data?.details) {
      console.log('Stack trace:', error.response.data.details);
    }
  }
}

async function testAnalyzeReport() {
  console.log('\n=== Testing Analyze Report Endpoint ===\n');
  
  const testData = {
    reportType: 'Blood Test',
    reportData: `Hemoglobin: 13.5 g/dL
WBC Count: 7500 cells/mcL
RBC Count: 4.8 million/mcL
Platelet Count: 250000 /mcL
Hematocrit: 42 %
MCV: 90 fL
MCH: 30 pg
MCHC: 34 g/dL`
  };

  try {
    console.log('Sending request to:', `${BASE_URL}/analyze-report`);
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/analyze-report`, testData);
    
    console.log('\n✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('\n❌ ERROR!');
    console.log('Status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message || error.message);
    console.log('Error details:', error.response?.data?.error);
    if (error.response?.data?.details) {
      console.log('Stack trace:', error.response.data.details);
    }
  }
}

async function runTests() {
  console.log('🧪 Testing Health Prediction Endpoints');
  console.log('Make sure your server is running on http://localhost:5000\n');
  
  await testGeneralPrediction();
  await testAnalyzeReport();
  
  console.log('\n✨ Tests completed!\n');
}

runTests();
