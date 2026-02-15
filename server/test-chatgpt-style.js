// Test ChatGPT-like health assistant
require('dotenv').config();
const axios = require('axios');

const testChatGPTStyle = async () => {
  console.log('\n🧪 Testing ChatGPT-Style Health Assistant\n');

  const systemPrompt = {
    role: 'system',
    content: `You are an AI health assistant, like ChatGPT but specialized in healthcare. Answer ANY health-related questions naturally and helpfully.

Your capabilities:
1. Answer health questions (symptoms, treatments, medications, lifestyle, nutrition, etc.)
2. Provide health advice and information
3. Respond to greetings naturally
4. Have natural conversations about health topics

IMPORTANT: When you have enough information about a patient's condition, recommend a specialist:
{"specialization": "SpecialistName", "reason": "Brief explanation"}

Valid specialists: Cardiologist, Dermatologist, Neurologist, Orthopedic, Pediatrician, Psychiatrist, General Physician, ENT Specialist, Gynecologist, Ophthalmologist

Be conversational, empathetic, and informative.`
  };

  const testQueries = [
    { query: 'Hi', expected: 'Natural greeting' },
    { query: 'What causes headaches?', expected: 'Informative answer about headaches' },
    { query: 'How can I reduce stress?', expected: 'Stress management tips' },
    { query: 'I have chest pain for 2 days', expected: 'Discussion + recommend Cardiologist' },
    { query: 'What foods are good for heart health?', expected: 'Nutrition advice' }
  ];

  for (const test of testQueries) {
    console.log(`\n--- Test: ${test.expected} ---`);
    console.log(`User: "${test.query}"`);

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            systemPrompt,
            { role: 'user', content: test.query }
          ],
          temperature: 0.7,
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      console.log(`AI: "${aiResponse.substring(0, 200)}${aiResponse.length > 200 ? '...' : ''}"`);

      // Check for specialization
      if (aiResponse.includes('"specialization"')) {
        const jsonMatch = aiResponse.match(/\{[^}]*"specialization"[^}]*\}/);
        if (jsonMatch) {
          console.log(`\n✅ Specialist Recommended: ${jsonMatch[0]}`);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n✨ Test Complete!\n');
};

testChatGPTStyle();
