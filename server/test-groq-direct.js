const axios = require('axios');
require('dotenv').config();

async function testGroq() {
  console.log('🧪 Testing Groq API...\n');
  
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in .env');
    return;
  }
  
  console.log('API Key preview:', process.env.GROQ_API_KEY.substring(0, 15) + '...\n');
  
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello in one sentence' }
        ],
        temperature: 0.3,
        max_tokens: 50
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Groq API is working!');
    console.log('Response:', response.data.choices[0].message.content);
    console.log('\nFull response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Groq API failed!');
    console.error('Error:', error.message);
    console.error('Status:', error.response?.status);
    console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testGroq();
