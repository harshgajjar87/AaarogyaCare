// Test one-question-at-a-time flow
require('dotenv').config();
const axios = require('axios');

const testOneQuestionFlow = async () => {
  console.log('\n🧪 Testing One-Question-at-a-Time Flow\n');

  const systemPrompt = {
    role: 'system',
    content: `You are a medical triage assistant. Ask ONLY ONE question at a time (never multiple). Keep it SHORT. Gather patient history step-by-step. After 4-5 details, recommend with [SPECIALIST:Name]`
  };

  const conversation = [
    'I have chest pain',
    'Severe',
    'Center of chest',
    '2 days',
    'Yes, shortness of breath'
  ];

  const history = [];

  for (let i = 0; i < conversation.length; i++) {
    console.log(`\n--- Step ${i + 1} ---`);
    console.log(`User: "${conversation[i]}"`);

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            systemPrompt,
            ...history,
            { role: 'user', content: conversation[i] }
          ],
          temperature: 0.7,
          max_tokens: 100
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      console.log(`AI: "${aiResponse}"`);

      // Check if it's asking multiple questions
      const questionMarks = (aiResponse.match(/\?/g) || []).length;
      if (questionMarks > 1) {
        console.log('⚠️  WARNING: AI asked multiple questions!');
      } else if (questionMarks === 1) {
        console.log('✅ Good: Single question');
      }

      // Update history
      history.push({ role: 'user', content: conversation[i] });
      history.push({ role: 'assistant', content: aiResponse });

      // Check for specialist recommendation
      if (aiResponse.includes('[SPECIALIST:')) {
        const match = aiResponse.match(/\[SPECIALIST:([^\]]+)\]/);
        if (match) {
          console.log(`\n✅ Specialist Recommended: ${match[1]}`);
          break;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      break;
    }
  }

  console.log('\n✨ Test Complete!\n');
};

testOneQuestionFlow();
