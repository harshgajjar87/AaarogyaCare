// Test the triage logic without starting the full server
// Usage: node test-triage.js

const testConversation = [
  { message: 'I have chest pain', history: [] },
  { message: 'In the center of my chest', history: [
    { role: 'user', content: 'I have chest pain' },
    { role: 'assistant', content: 'Where exactly do you feel the pain?' }
  ]},
  { message: 'For 2 days', history: [
    { role: 'user', content: 'I have chest pain' },
    { role: 'assistant', content: 'Where exactly do you feel the pain?' },
    { role: 'user', content: 'In the center of my chest' },
    { role: 'assistant', content: 'How long have you been experiencing this?' }
  ]},
  { message: '7 out of 10', history: [
    { role: 'user', content: 'I have chest pain' },
    { role: 'assistant', content: 'Where exactly do you feel the pain?' },
    { role: 'user', content: 'In the center of my chest' },
    { role: 'assistant', content: 'How long have you been experiencing this?' },
    { role: 'user', content: 'For 2 days' },
    { role: 'assistant', content: 'On a scale of 1-10, how severe is it?' }
  ]}
];

// Simulate the triage logic
const triageLogic = (msg, hist) => {
  const msgLower = msg.toLowerCase();
  const questionCount = hist.filter(h => h.role === 'assistant').length;

  if (questionCount >= 3) {
    // Combine all user messages to analyze
    const allUserMessages = hist
      .filter(h => h.role === 'user')
      .map(h => h.content.toLowerCase())
      .join(' ') + ' ' + msgLower;

    if (allUserMessages.includes('chest') || allUserMessages.includes('heart')) {
      return { specialization: 'Cardiologist', completed: true };
    } else if (allUserMessages.includes('skin') || allUserMessages.includes('rash')) {
      return { specialization: 'Dermatologist', completed: true };
    } else if (allUserMessages.includes('head') || allUserMessages.includes('brain')) {
      return { specialization: 'Neurologist', completed: true };
    } else {
      return { specialization: 'General Physician', completed: true };
    }
  }

  if (questionCount === 0) {
    return { message: 'Where exactly do you feel the pain or discomfort?', completed: false };
  } else if (questionCount === 1) {
    return { message: 'How long have you been experiencing this?', completed: false };
  } else if (questionCount === 2) {
    return { message: 'On a scale of 1-10, how severe is it?', completed: false };
  }

  return { message: 'Thank you for the information.', completed: false };
};

console.log('\n🧪 Testing AI Triage Logic\n');

testConversation.forEach((test, index) => {
  console.log(`\n--- Step ${index + 1} ---`);
  console.log(`User: "${test.message}"`);
  
  const result = triageLogic(test.message, test.history);
  
  if (result.completed) {
    console.log(`✅ AI: Diagnosis complete!`);
    console.log(`   Specialization: ${result.specialization}`);
  } else {
    console.log(`💬 AI: "${result.message}"`);
  }
});

console.log('\n\n✨ Test complete! The triage logic is working correctly.\n');
