const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const doctors = await User.find({ role: 'doctor' })
    .select('name email doctorDetails.specialization doctorDetails.experience doctorDetails.consultationFee')
    .sort({ 'doctorDetails.specialization': 1, name: 1 });
  
  const grouped = {};
  doctors.forEach(d => {
    const spec = d.doctorDetails.specialization;
    if (!grouped[spec]) grouped[spec] = [];
    grouped[spec].push(d);
  });
  
  console.log('\n📊 SEEDED DOCTORS SUMMARY');
  console.log('='.repeat(80));
  
  Object.keys(grouped).sort().forEach(spec => {
    console.log(`\n${spec} (${grouped[spec].length} doctors):`);
    grouped[spec].forEach(d => {
      console.log(`  • ${d.name} - ${d.doctorDetails.experience}y exp - Rs.${d.doctorDetails.consultationFee} - ${d.email}`);
    });
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(`Total: ${doctors.length} doctors across ${Object.keys(grouped).length} specializations`);
  console.log('Password for all doctors: doctor123');
  console.log('='.repeat(80) + '\n');
  
  process.exit(0);
});
