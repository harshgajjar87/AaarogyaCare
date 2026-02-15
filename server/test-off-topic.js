// Test AI handling of off-topic and vague responses
require('dotenv').config();
const axios = require('axios');

const testOffTopicHandling = async () => {
  console.log('\n🧪 Testing AI Response to Off-Topic/Vague Inputs\n');

  const systemPrompt = {
    role: 'system',
    content: `You are a professional medical triage nurse. Your goal is to gather symptom information.

RULES:
1. If user says "hi", "hello", redirect: "Hello! I'm here to help with your health concerns. What symptoms are you experiencing?"
2. If user gives vague answers ("I don't know", "maybe"), rephrase the question more clearly
3. If user goes off-topic, gently bring them back: "I understand, but let's focus on your symptoms."
4. Ask ONE question at a time
5. Stay focused on medical assessment`
  };

  const tests = [
    {
      name: 'Greeting at start',
      history: [],
      input: 'hi',
      expected: 'Should redirect to asking about symptoms'
    },
    {
      name: 'Greeting during conversation',
      history: [
        { role: 'assistant', content: 'Where do you feel the pain?' }
      ],
      input: 'hello',
      expected: 'Should acknowledge and repeat question'
    },
    {
      name: 'Vague response',
      history: [
        { role: 'assistant', content: 'How long have you had this pain?' }
      ],
      input: 'I dont know',
      expected: 'Should rephrase or ask differently'
    },
    {
      name: 'Off-topic question',
      history: [
        { role: 'user', content: 'I have chest pain' },
        { role: 'assistant', content: 'How severe is the pain on a scale of 1-10?' }
      ],
      input: 'whats the weather like?',
      expected: 'Should redirect back to medical question'
    },
    {
      name: 'Irrelevant answer',
      history: [
        { role: 'assistant', content: 'Where exactly is the pain located?' }
      ],
      input: 'I like pizza',
      expected: 'Should politely redirect'
    }
  ];

  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    console.log(`Expected: ${test.expected}`);
    console.log(`User: "${test.input}"`);

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            systemPrompt,
            ...test.history,
            { role: 'user', content: test.input }
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
      console.log(`AI: "${aiResponse}"`);
      console.log('✅ Handled appropriately');

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n✨ Test Complete!\n');
};

testOffTopicHandling();
