// Extract medicine names from indiadrugbank.json
// Run with: node extract-medicine-names.js

const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('Extract Medicine Names from JSON');
console.log('='.repeat(60));
console.log('');

const dataDir = path.join(__dirname, '..', 'client', 'src', 'data');
const inputFile = path.join(dataDir, 'indiadrugbank.json');
const outputFile = path.join(dataDir, 'indiadrugbank-names.json');

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.log('❌ File not found: indiadrugbank.json');
  console.log('');
  console.log('Please place your JSON file at:');
  console.log(`  ${inputFile}`);
  console.log('');
  process.exit(1);
}

console.log('📂 Reading file...');
const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

console.log('✅ File loaded successfully');
console.log('');

let medicineNames = [];

// Determine data structure and extract names
if (Array.isArray(data)) {
  console.log(`📊 Data type: Array with ${data.length} items`);
  console.log('');
  
  if (data.length > 0) {
    const sample = data[0];
    
    if (typeof sample === 'string') {
      // Simple string array
      console.log('📝 Format: Simple string array');
      medicineNames = data;
    } else if (typeof sample === 'object') {
      // Array of objects
      console.log('📝 Format: Array of objects');
      console.log('');
      console.log('Available fields:');
      Object.keys(sample).forEach(key => {
        console.log(`  - ${key}`);
      });
      console.log('');
      
      // Try to find name field
      const nameFields = ['name', 'medicine_name', 'drug_name', 'product_name', 'brand_name', 'Name', 'Medicine Name', 'Drug Name'];
      let nameField = null;
      
      for (const field of nameFields) {
        if (field in sample) {
          nameField = field;
          break;
        }
      }
      
      if (nameField) {
        console.log(`✅ Using field: "${nameField}"`);
        medicineNames = data
          .map(item => item[nameField])
          .filter(name => name && typeof name === 'string');
      } else {
        console.log('⚠️  Could not find name field automatically');
        console.log('');
        console.log('Please specify which field contains the medicine name:');
        console.log('Available fields:', Object.keys(sample).join(', '));
        process.exit(1);
      }
    }
  }
} else if (typeof data === 'object') {
  console.log('📊 Data type: Object');
  console.log(`🔑 Keys: ${Object.keys(data).length}`);
  
  // Try to extract values
  medicineNames = Object.values(data)
    .filter(value => typeof value === 'string');
}

// Remove duplicates and sort
medicineNames = [...new Set(medicineNames)].sort();

console.log('');
console.log(`✅ Extracted ${medicineNames.length} unique medicine names`);
console.log('');

// Show samples
console.log('📝 Sample medicine names (first 10):');
medicineNames.slice(0, 10).forEach((name, idx) => {
  console.log(`  ${idx + 1}. ${name}`);
});
console.log('');

// Save to file
fs.writeFileSync(outputFile, JSON.stringify(medicineNames, null, 2), 'utf8');

console.log(`💾 Saved to: ${outputFile}`);
console.log('');
console.log('='.repeat(60));
console.log('✅ Extraction Complete!');
console.log('='.repeat(60));
console.log('');
console.log('Next steps:');
console.log('  1. Restart your application: npm start');
console.log('  2. Test the medicine search in prescription form');
console.log('');
