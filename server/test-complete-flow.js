// Test complete ChatGPT-style conversation with specialist recommendation
require('dotenv').config();
const axios = require('axios');

const testCompleteFlow = async () => {
  console.log('\n🧪 Testing Complete ChatGPT-Style Health Assistant Flow\n');

  const systemPrompt = {
    role: 'system',
    content: `You are an AI health assistant, like ChatGPT. Answer ANY health questions naturally.

CRITICAL: When discussing symptoms, after 2-3 exchanges, YOU MUST recommend a specialist:
{"specialization": "SpecialistName", "reason": "Brief explanation"}

Valid specialists: Cardiologist, Dermatologist, Neurologist, Orthopedic, Pediatrician, Psychiatrist, General Physician, ENT Specialist, Gynecologist, Ophthalmologist

Be conversational and always recommend specialists when symptoms are discussed.`
  };

  // Test 1: General health question
  console.log('=== Test 1: General Health Question ===\n');
  let res1 = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'llama-3.1-8b-instant',
    messages: [systemPrompt, { role: 'user', content: 'What are benefits of exercise?' }],
    max_tokens: 200
  }, { headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` } });
  
  console.log('User: "What are benefits of exercise?"');
  console.log(`AI: ${res1.data.choices[0].message.content.substring(0, 150)}...\n`);
  await new Promise(r => setTimeout(r, 1000));

  // Test 2: Symptom conversation leading to specialist
  console.log('=== Test 2: Symptom Discussion → Specialist Recommendation ===\n');
  
  const conversation = [
    { role: 'user', content: 'I have been having chest pain' }
  ];

  console.log('User: "I have been having chest pain"');
  let res2 = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'llama-3.1-8b-instant',
    messages: [systemPrompt, ...conversation],
    max_tokens: 200
  }, { headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` } });
  
  const aiResponse1 = res2.data.choices[0].message.content;
  console.log(`AI: ${aiResponse1}\n`);
  
  conversation.push({ role: 'assistant', content: aiResponse1 });
  conversation.push({ role: 'user', content: 'Sharp pain in center of chest, for 2 days, severity 8/10' });
  
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('User: "Sharp pain in center of chest, for 2 days, severity 8/10"');
  let res3 = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'llama-3.1-8b-instant',
    messages: [systemPrompt, ...conversation],
    max_tokens: 300
  }, { headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` } });
  
  const aiResponse2 = res3.data.choices[0].message.content;
  console.log(`AI: ${aiResponse2}\n`);

  // Check for specialization
  if (aiResponse2.includes('"specialization"')) {
    const jsonMatch = aiResponse2.match(/\{[^}]*"specialization"[^}]*\}/);
    if (jsonMatch) {
      console.log(`✅ SUCCESS: Specialist Recommended - ${jsonMatch[0]}\n`);
    }
  } else {
    console.log('⚠️  No specialist recommendation found. Trying one more exchange...\n');
    
    conversation.push({ role: 'assistant', content: aiResponse2 });
    conversation.push({ role: 'user', content: 'Yes, also shortness of breath' });
    
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('User: "Yes, also shortness of breath"');
    let res4 = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.1-8b-instant',
      messages: [systemPrompt, ...conversation],
      max_tokens: 300
    }, { headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` } });
    
    const aiResponse3 = res4.data.choices[0].message.content;
    console.log(`AI: ${aiResponse3}\n`);
    
    if (aiResponse3.includes('"specialization"')) {
      const jsonMatch = aiResponse3.match(/\{[^}]*"specialization"[^}]*\}/);
      if (jsonMatch) {
        console.log(`✅ SUCCESS: Specialist Recommended - ${jsonMatch[0]}\n`);
      }
    }
  }

  console.log('✨ Test Complete!\n');
};

testCompleteFlow();
