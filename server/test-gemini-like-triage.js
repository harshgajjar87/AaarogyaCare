require('dotenv').config();

// Copy exact pattern from triageController.js
let useGemini = false;
let genAI = null;

try {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  if (process.env.GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    useGemini = true;
    console.log('✅ Gemini initialized successfully');
    console.log('API Key preview:', process.env.GOOGLE_API_KEY.substring(0, 15) + '...');
  }
} catch (e) {
  console.log('❌ Gemini not available:', e.message);
}

async function testGemini() {
  if (useGemini && genAI) {
    try {
      console.log('\n🧪 Testing Gemini with exact triage pattern...\n');
      
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const chatHistory = [
        { role: 'user', parts: [{ text: 'You are a test assistant.' }] },
        { role: 'model', parts: [{ text: 'OK.' }] }
      ];
      
      const chat = model.startChat({ 
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 50,
          temperature: 0.3
        }
      });
      
      const result = await chat.sendMessage('Say hello');
      const response = result.response.text();
      
      console.log('✅ SUCCESS!');
      console.log('Response:', response);
      
    } catch (error) {
      console.log('❌ ERROR!');
      console.log('Message:', error.message);
      console.log('Status:', error.status);
      console.log('Code:', error.code);
    }
  } else {
    console.log('❌ Gemini not initialized');
  }
}

testGemini();
