const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_API_KEY;

const modelsToTest = [
  'gemini-pro',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.0-pro',
  'gemini-1.0-pro-latest'
];

async function testModel(modelName) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: 'Say hello'
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      model: modelName,
      working: true,
      response: response.data.candidates[0].content.parts[0].text
    };
  } catch (error) {
    return {
      model: modelName,
      working: false,
      error: error.response?.data?.error?.message || error.message,
      status: error.response?.status
    };
  }
}

async function findWorkingModel() {
  console.log('🔍 Testing Gemini models...\n');
  console.log('API Key:', API_KEY?.substring(0, 15) + '...\n');
  
  for (const model of modelsToTest) {
    console.log(`Testing: ${model}`);
    const result = await testModel(model);
    
    if (result.working) {
      console.log(`✅ ${model} - WORKS!`);
      console.log(`   Response: ${result.response}\n`);
    } else {
      console.log(`❌ ${model} - Failed`);
      console.log(`   Error: ${result.error}\n`);
    }
  }
  
  console.log('\n📋 Trying to list available models...');
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    
    console.log('\n✅ Available models:');
    response.data.models.forEach(model => {
      console.log(`  - ${model.name}`);
      console.log(`    Supported methods: ${model.supportedGenerationMethods?.join(', ')}`);
    });
  } catch (error) {
    console.log('❌ Could not list models:', error.response?.data?.error?.message || error.message);
  }
}

findWorkingModel();
