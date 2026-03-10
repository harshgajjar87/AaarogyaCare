// Test script to verify medicine database integration
// Run with: node test-medicine-database.js

const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('Medicine Database Integration Test');
console.log('='.repeat(60));
console.log('');

// Check if India Drug Bank files exist
const dataDir = path.join(__dirname, '..', 'client', 'src', 'data');
const fullDataPath = path.join(dataDir, 'indiadrugbank.json');
const namesPath = path.join(dataDir, 'indiadrugbank-names.json');

console.log('📂 Checking for dataset files...');
console.log('');

let fullDataExists = fs.existsSync(fullDataPath);
let namesExists = fs.existsSync(namesPath);

console.log(`Full dataset (indiadrugbank.json): ${fullDataExists ? '✅ Found' : '❌ Not found'}`);
console.log(`Names list (indiadrugbank-names.json): ${namesExists ? '✅ Found' : '❌ Not found'}`);
console.log('');

if (!fullDataExists && !namesExists) {
  console.log('❌ Dataset files not found!');
  console.log('');
  console.log('Please run the setup script first:');
  console.log('  Windows: scripts\\setup-medicine-database.bat');
  console.log('  Manual: python scripts/download-medicine-dataset.py');
  console.log('');
  process.exit(1);
}

// Load and analyze the data
if (namesExists) {
  console.log('📊 Analyzing medicine names dataset...');
  console.log('');
  
  const names = JSON.parse(fs.readFileSync(namesPath, 'utf8'));
  
  console.log(`Total medicines: ${names.length}`);
  console.log('');
  
  console.log('Sample medicines (first 10):');
  names.slice(0, 10).forEach((name, idx) => {
    console.log(`  ${idx + 1}. ${name}`);
  });
  console.log('');
  
  // Test search functionality
  console.log('🔍 Testing search functionality...');
  console.log('');
  
  const searchTests = ['para', 'amox', 'ibup', 'azith', 'cipro'];
  
  searchTests.forEach(term => {
    const results = names.filter(name => 
      name.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 5);
    
    console.log(`Search "${term}": ${results.length > 0 ? '✅' : '❌'} (${results.length} results)`);
    if (results.length > 0) {
      results.forEach(r => console.log(`    - ${r}`));
    }
    console.log('');
  });
}

if (fullDataExists) {
  console.log('📊 Analyzing full dataset...');
  console.log('');
  
  const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));
  
  console.log(`Total records: ${fullData.length}`);
  console.log('');
  
  if (fullData.length > 0) {
    console.log('Sample record structure:');
    console.log(JSON.stringify(fullData[0], null, 2));
    console.log('');
    
    console.log('Available fields:');
    Object.keys(fullData[0]).forEach(key => {
      console.log(`  - ${key}`);
    });
  }
}

console.log('');
console.log('='.repeat(60));
console.log('✅ Test Complete!');
console.log('='.repeat(60));
console.log('');
console.log('Next steps:');
console.log('  1. Start your application: npm start');
console.log('  2. Go to Doctor Dashboard → Create Prescription');
console.log('  3. Test the medicine search dropdown');
console.log('');
