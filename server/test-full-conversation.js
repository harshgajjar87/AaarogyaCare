// Test full conversation with non-answers
require('dotenv').config();
const axios = require('axios');

const testFullConversation = async () => {
  console.log('\n🧪 Testing Full Conversation with Non-Answers\n');

  const systemPrompt = {
    role: 'system',
    content: `You are a professional medical triage nurse.

CRITICAL RULES:
1. BEFORE answering, check if user's response actually answers your question
2. If they say "hi", "hello" → Respond: "Hello! To help you, I need to know: [repeat your question]"
3. If unrelated answer → Respond: "I understand, but I need to know: [repeat your question]"
4. NEVER move to next question unless you get a relevant answer
5. After 3-4 ACTUAL answers, respond with: {"specialization": "SpecialistName"}`
  };

  const conversation = [
    { user: 'I have chest pain', expected: 'Should ask follow-up question' },
    { user: 'hi', expected: 'Should repeat the question' },
    { user: 'in the center', expected: 'Should ask next question' },
    { user: 'hello', expected: 'Should repeat the question' },
    { user: '2 days', expected: 'Should ask next question' },
    { user: '8', expected: 'Should determine specialization' }
  ];

  const history = [];

  for (let i = 0; i < conversation.length; i++) {
    const step = conversation[i];
    console.log(`\n--- Step ${i + 1} ---`);
    console.log(`Expected: ${step.expected}`);
    console.log(`User: "${step.user}"`);

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            systemPrompt,
            ...history,
            { role: 'user', content: step.user }
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
      console.log(`AI: "${aiResponse}"`);

      // Update history
      history.push({ role: 'user', content: step.user });
      history.push({ role: 'assistant', content: aiResponse });

      // Check for specialization
      if (aiResponse.includes('"specialization"')) {
        const jsonMatch = aiResponse.match(/\{[^}]*"specialization"[^}]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log(`\n✅ Diagnosis Complete: ${parsed.specialization}`);
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

testFullConversation();
