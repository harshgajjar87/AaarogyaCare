// Run this file to verify your AI Triage setup
// Usage: node verify-setup.js

require('dotenv').config();

console.log('\n🔍 Verifying AI Triage Setup...\n');

// Check 1: Environment Variables
console.log('1️⃣ Checking Environment Variables:');
const checks = {
  'GOOGLE_API_KEY': !!process.env.GOOGLE_API_KEY,
  'MONGO_URI': !!process.env.MONGO_URI,
  'JWT_SECRET': !!process.env.JWT_SECRET,
};

Object.entries(checks).forEach(([key, value]) => {
  console.log(`   ${value ? '✅' : '❌'} ${key}: ${value ? 'Set' : 'Missing'}`);
});

// Check 2: Package Installation
console.log('\n2️⃣ Checking Package Installation:');
try {
  require('@google/generative-ai');
  console.log('   ✅ @google/generative-ai: Installed');
} catch (e) {
  console.log('   ❌ @google/generative-ai: Not installed');
  console.log('   Run: npm install @google/generative-ai');
}

// Check 3: Test Google AI Connection
console.log('\n3️⃣ Testing Google AI Connection:');
if (process.env.GOOGLE_API_KEY) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
  (async () => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Say "Hello"');
      const response = result.response.text();
      console.log('   ✅ Google AI API: Working');
      console.log(`   Response: ${response.substring(0, 50)}...`);
    } catch (error) {
      console.log('   ❌ Google AI API: Error');
      console.log(`   Error: ${error.message}`);
      console.log('\n   💡 Possible fixes:');
      console.log('   - Check if your API key is valid');
      console.log('   - Get a new key from: https://aistudio.google.com/app/apikey');
      console.log('   - Make sure you have internet connection');
    }

    // Check 4: MongoDB Connection
    console.log('\n4️⃣ Testing MongoDB Connection:');
    if (process.env.MONGO_URI) {
      const mongoose = require('mongoose');
      try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('   ✅ MongoDB: Connected');
        await mongoose.connection.close();
      } catch (error) {
        console.log('   ❌ MongoDB: Connection failed');
        console.log(`   Error: ${error.message}`);
      }
    } else {
      console.log('   ❌ MONGO_URI not set');
    }

    console.log('\n✨ Setup verification complete!\n');
    process.exit(0);
  })();
} else {
  console.log('   ⚠️  Skipped (GOOGLE_API_KEY not set)');
  console.log('\n💡 To fix:');
  console.log('   1. Go to: https://aistudio.google.com/app/apikey');
  console.log('   2. Create a new API key');
  console.log('   3. Add to server/.env: GOOGLE_API_KEY=your_key_here');
  console.log('   4. Restart the server\n');
  process.exit(1);
}
