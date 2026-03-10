/**
 * Test script for AI Medical Report Extraction
 * 
 * This script tests the AI extraction endpoint directly
 * Run with: node test-ai-extraction.js
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5000';

// You'll need a valid JWT token - get it by logging in first
const AUTH_TOKEN = 'your_jwt_token_here';

async function testExtraction() {
  console.log('🧪 Testing AI Medical Report Extraction\n');

  // Check if test file exists
  const testFilePath = path.join(__dirname, 'test-report.jpg');
  
  if (!fs.existsSync(testFilePath)) {
    console.log('⚠️  No test file found at:', testFilePath);
    console.log('\nTo test this feature:');
    console.log('1. Create a test medical report image (test-report.jpg)');
    console.log('2. Or use the web interface:');
    console.log('   - Navigate to Health Prediction → Report Analysis');
    console.log('   - Select a report type');
    console.log('   - Upload your medical report');
    console.log('   - Watch the AI extract the values!\n');
    return;
  }

  try {
    console.log('📤 Uploading test report...');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('reportType', 'blood');

    const response = await axios.post(
      `${API_BASE_URL}/api/ai/extract-medical-report`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      }
    );

    console.log('✅ Extraction successful!\n');
    console.log('📊 Extracted Data:');
    console.log(JSON.stringify(response.data.extractedData, null, 2));
    console.log('\n✨ The form would be auto-filled with these values!');

  } catch (error) {
    console.error('❌ Test failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.msg || error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n💡 Tip: You need to be logged in to use this feature');
        console.log('Please test through the web interface instead.');
      }
    } else {
      console.error(error.message);
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await axios.get(`${API_BASE_URL}/`);
    console.log('✅ Server is running:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Server is not running at', API_BASE_URL);
    console.log('Please start the server with: cd server && npm run dev');
    return false;
  }
}

// Main execution
(async () => {
  console.log('==========================================');
  console.log('AI Medical Report Extraction Test');
  console.log('==========================================\n');

  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    process.exit(1);
  }

  console.log('\n📝 Testing through web interface is recommended:');
  console.log('1. Start the React app: cd client && npm start');
  console.log('2. Login to your account');
  console.log('3. Navigate to: Health Prediction → Report Analysis');
  console.log('4. Select a report type (e.g., Blood Test)');
  console.log('5. Upload a medical report image or PDF');
  console.log('6. Click "Extract Data with AI"');
  console.log('7. Watch the magic happen! ✨\n');

  console.log('==========================================\n');
})();
