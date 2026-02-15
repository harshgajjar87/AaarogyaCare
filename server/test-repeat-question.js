// Test: AI should repeat question when user says "hi" instead of answering
require('dotenv').config();
const axios = require('axios');

const testRepeatQuestion = async () => {
  console.log('\n🧪 Testing: AI should NOT move forward when user says "hi"\n');

  const systemPrompt = {
    role: 'system',
    content: `You are a professional medical triage nurse.

CRITICAL RULES:
1. BEFORE answering, check if user's response actually answers your question
2. If they say "hi", "hello", "hey" → Respond: "Hello! To help you, I need to know: [repeat your question]"
3. NEVER move to next question unless you get a relevant answer
4. INSIST on getting actual answers before proceeding`
  };

  console.log('Scenario: AI asks "Where do you feel pain?" and user says "hi"\n');

  const history = [
    { role: 'assistant', content: 'Where exactly do you feel the pain or discomfort?' }
  ];

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          systemPrompt,
          ...history,
          { role: 'user', content: 'hi' }
        ],
        temperature: 0.5,
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
    
    console.log('User: "hi"');
    console.log(`AI: "${aiResponse}"\n`);

    // Check if AI repeated the question
    if (aiResponse.toLowerCase().includes('where') && 
        (aiResponse.toLowerCase().includes('pain') || aiResponse.toLowerCase().includes('feel'))) {
      console.log('✅ PASS: AI repeated the question instead of moving forward');
    } else {
      console.log('❌ FAIL: AI did not repeat the question');
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('\n✨ Test Complete!\n');
};

testRepeatQuestion();
