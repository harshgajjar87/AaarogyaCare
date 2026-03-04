const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testReportAnalysis() {
  console.log('Testing Report Analysis Endpoint...\n');
  
  // Check API key
  if (!process.env.GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY is not set in .env file');
    return;
  }
  console.log('✅ GOOGLE_API_KEY is configured');
  console.log('Key preview:', process.env.GOOGLE_API_KEY.substring(0, 10) + '...\n');

  try {
    console.log('Initializing Google Generative AI...');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    console.log('Getting model (gemini-1.5-flash)...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const testReportData = `Hemoglobin: 13.5 g/dL
WBC Count: 7500 cells/mcL
RBC Count: 4.8 million/mcL
Platelet Count: 250000 /mcL`;

    const prompt = `You are a medical AI assistant helping patients understand their Blood Test. 

Report Data:
${testReportData}

Analyze this medical report and provide a comprehensive, easy-to-understand explanation in JSON format:

1. summary: Brief overview of the report
2. parameters: Array of objects with {name, value, status (normal/borderline/abnormal), explanation, normalRange}
3. goodPoints: Array of positive findings
4. concerns: Array of concerning findings
5. recommendations: Array of actionable suggestions
6. disclaimer: Reminder to consult healthcare provider

Make it simple for someone with no medical knowledge. Format as valid JSON only, no markdown.`;

    console.log('Sending request to Gemini API...\n');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Received response from Gemini API\n');
    console.log('Raw response:');
    console.log(text);
    console.log('\n---\n');
    
    // Try to parse JSON
    try {
      const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
      console.log('✅ Successfully parsed JSON response');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.status);
    
    if (error.response) {
      console.error('Response:', error.response);
    }
    
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  }
}

testReportAnalysis();
