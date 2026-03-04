const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Appointment = require('./models/Appointment');
const User = require('./models/User'); // Need to load User model for populate

dotenv.config();

const testEndpoint = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // This simulates what the controller does
    const appointments = await Appointment.find({})
      .populate('patientId', 'name email profile.phone')
      .populate('doctorId', 'name email profile.phone profile.specialization')
      .sort({ createdAt: -1 });

    console.log('📊 Query Result:');
    console.log(`   Total appointments found: ${appointments.length}\n`);

    if (appointments.length > 0) {
      console.log('📋 Appointments:');
      appointments.forEach((apt, idx) => {
        console.log(`\n   ${idx + 1}. ID: ${apt._id}`);
        console.log(`      Patient: ${apt.patientId?.name || 'N/A'} (${apt.patientId?.email || 'N/A'})`);
        console.log(`      Doctor: ${apt.doctorId?.name || 'N/A'} (${apt.doctorId?.email || 'N/A'})`);
        console.log(`      Date: ${apt.date.toLocaleDateString()} at ${apt.time}`);
        console.log(`      Status: ${apt.status}`);
        console.log(`      Reason: ${apt.reason || 'N/A'}`);
        console.log(`      Fees: ₹${apt.fees}`);
      });
    } else {
      console.log('   ⚠️  No appointments found in database');
    }

    console.log('\n✅ This is exactly what the API should return');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testEndpoint();
