// Test Groq-powered triage system
// Usage: node test-groq-triage.js

require('dotenv').config();
const axios = require('axios');

const testTriageConversation = async () => {
  console.log('\n🧪 Testing Groq AI Triage System\n');

  const history = [];
  const messages = [
    'I have chest pain',
    'In the center of my chest',
    'For 2 days',
    '8 out of 10'
  ];

  for (let i = 0; i < messages.length; i++) {
    console.log(`\n--- Step ${i + 1} ---`);
    console.log(`👤 Patient: "${messages[i]}"`);

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are a medical triage nurse. Ask ONE question at a time to understand symptoms.
Rules:
1. Ask ONLY ONE question per response
2. Focus on: location, duration, severity (1-10), related symptoms
3. After 3-4 questions, respond with ONLY: {"specialization": "SpecialistName"}

Valid specialists: Cardiologist, Dermatologist, Neurologist, Orthopedic, Pediatrician, Psychiatrist, General Physician, ENT Specialist, Gynecologist, Ophthalmologist`
            },
            ...history,
            { role: 'user', content: messages[i] }
          ],
          temperature: 0.7,
          max_tokens: 150
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      console.log(`🤖 AI Doctor: "${aiResponse}"`);

      // Update history
      history.push({ role: 'user', content: messages[i] });
      history.push({ role: 'assistant', content: aiResponse });

      // Check for specialization
      if (aiResponse.includes('"specialization"')) {
        const jsonMatch = aiResponse.match(/\{[^}]*"specialization"[^}]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log(`\n✅ Diagnosis Complete!`);
          console.log(`   Recommended Specialist: ${parsed.specialization}`);
          break;
        }
      }

      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.error?.message || error.message}`);
      break;
    }
  }

  console.log('\n✨ Test Complete!\n');
};

// Run test
testTriageConversation();
