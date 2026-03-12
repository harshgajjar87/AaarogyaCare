/**
 * Quick fix script for Dr. Preeti Gupta's missing appointment
 * Run: node server/scripts/fix-preeti-appointment.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Appointment = require('../models/Appointment');
const User = require('../models/User');

async function fixAppointment() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // The appointment ID from your error
    const appointmentId = '69b2538cc360a8032da18cd8';
    
    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      console.log('❌ Appointment not found');
      process.exit(1);
    }
    
    console.log('📋 Found appointment:');
    console.log('  Current doctorId:', appointment.doctorId);
    
    // Find Dr. Preeti Gupta
    const doctor = await User.findOne({ 
      name: /preeti gupta/i, 
      role: 'doctor' 
    });
    
    if (!doctor) {
      console.log('❌ Dr. Preeti Gupta not found');
      console.log('\n🔍 Searching for similar names:');
      const doctors = await User.find({ 
        name: /preeti/i, 
        role: { $in: ['doctor', 'pending_doctor'] }
      }).select('name email role');
      
      if (doctors.length === 0) {
        console.log('  No doctors found with "Preeti" in name');
      } else {
        console.log('  Found these doctors:');
        doctors.forEach((d, i) => {
          console.log(`  ${i + 1}. ${d.name} (${d.email}) - ${d.role}`);
        });
      }
      process.exit(1);
    }
    
    console.log('\n👨‍⚕️ Found Dr. Preeti Gupta:');
    console.log('  ID:', doctor._id);
    console.log('  Name:', doctor.name);
    console.log('  Email:', doctor.email);
    
    // Check if already correct
    if (appointment.doctorId.toString() === doctor._id.toString()) {
      console.log('\n✅ Appointment already assigned to Dr. Preeti Gupta!');
      console.log('  The issue might be elsewhere. Check:');
      console.log('  1. Is Dr. Preeti Gupta logged in?');
      console.log('  2. Is the server restarted?');
      console.log('  3. Any browser console errors?');
    } else {
      console.log('\n🔧 Fixing appointment...');
      appointment.doctorId = doctor._id;
      await appointment.save();
      console.log('✅ Appointment updated successfully!');
      console.log('  The appointment should now appear on Dr. Preeti Gupta\'s portal');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Done');
  }
}

fixAppointment();
