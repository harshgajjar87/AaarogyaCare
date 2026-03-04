const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  console.log('🔍 Checking available Gemini models...\n');
  
  if (!process.env.GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY not found in .env');
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
  // Test different model names
  const modelsToTest = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'models/gemini-pro',
    'models/gemini-1.5-flash'
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say "Hello"');
      const response = result.response.text();
      console.log(`✅ ${modelName} - WORKS! Response: ${response}\n`);
    } catch (error) {
      console.log(`❌ ${modelName} - FAILED: ${error.message}\n`);
    }
  }
}

listModels();
