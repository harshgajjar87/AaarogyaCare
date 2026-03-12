/**
 * Script to diagnose and fix appointment-doctor ID mismatches
 * 
 * This script helps identify appointments that exist in the database
 * but don't show up on a doctor's portal due to doctorId mismatch.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const Appointment = require('../models/Appointment');
const User = require('../models/User');

async function diagnoseAppointmentIssue() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the specific appointment ID from the error message
    const appointmentId = '69b2538cc360a8032da18cd8';
    
    console.log('🔍 Searching for appointment:', appointmentId);
    
    // Find the appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email');
    
    if (!appointment) {
      console.log('❌ Appointment not found in database');
      process.exit(1);
    }
    
    console.log('\n📋 Appointment Details:');
    console.log('  ID:', appointment._id);
    console.log('  Patient:', appointment.patientId?.name || 'N/A');
    console.log('  Doctor ID in appointment:', appointment.doctorId);
    console.log('  Doctor Name:', appointment.doctorId?.name || 'N/A');
    console.log('  Date:', appointment.date);
    console.log('  Time:', appointment.time);
    console.log('  Status:', appointment.status);
    
    // Find Dr. Preeti Gupta
    console.log('\n🔍 Searching for Dr. Preeti Gupta...');
    const doctor = await User.findOne({ 
      name: /preeti gupta/i, 
      role: 'doctor' 
    });
    
    if (!doctor) {
      console.log('❌ Dr. Preeti Gupta not found in database');
      console.log('\n💡 Searching for all doctors with "Preeti" in name:');
      const doctors = await User.find({ 
        name: /preeti/i, 
        role: { $in: ['doctor', 'pending_doctor'] }
      });
      doctors.forEach(d => {
        console.log(`  - ${d.name} (${d.email}) - ID: ${d._id} - Role: ${d.role}`);
      });
      process.exit(1);
    }
    
    console.log('\n👨‍⚕️ Dr. Preeti Gupta Details:');
    console.log('  ID:', doctor._id);
    console.log('  Name:', doctor.name);
    console.log('  Email:', doctor.email);
    console.log('  Role:', doctor.role);
    
    // Compare IDs
    console.log('\n🔍 Comparing IDs:');
    console.log('  Appointment doctorId:', appointment.doctorId?._id || appointment.doctorId);
    console.log('  Dr. Preeti Gupta ID:', doctor._id);
    
    const appointmentDoctorId = appointment.doctorId?._id || appointment.doctorId;
    const match = appointmentDoctorId.toString() === doctor._id.toString();
    
    if (match) {
      console.log('  ✅ IDs MATCH - Appointment should appear on portal');
      console.log('\n💡 If appointment still not showing, check:');
      console.log('  1. Doctor is logged in with correct account');
      console.log('  2. Frontend is fetching from correct API endpoint');
      console.log('  3. No JavaScript errors in browser console');
      console.log('  4. Server is running and accessible');
    } else {
      console.log('  ❌ IDs DO NOT MATCH - This is the problem!');
      console.log('\n🔧 Would you like to fix this? (Y/N)');
      console.log('  This will update the appointment to point to Dr. Preeti Gupta');
      
      // For automated fix, uncomment below:
      /*
      appointment.doctorId = doctor._id;
      await appointment.save();
      console.log('  ✅ Appointment updated successfully!');
      console.log('  The appointment should now appear on Dr. Preeti Gupta\'s portal');
      */
      
      console.log('\n💡 To fix manually, run this MongoDB command:');
      console.log(`  db.appointments.updateOne(`);
      console.log(`    { _id: ObjectId("${appointmentId}") },`);
      console.log(`    { $set: { doctorId: ObjectId("${doctor._id}") } }`);
      console.log(`  )`);
    }
    
    // Check all appointments for this doctor
    console.log('\n📊 All appointments for Dr. Preeti Gupta:');
    const allAppointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`  Total: ${allAppointments.length} appointments`);
    allAppointments.forEach((apt, index) => {
      console.log(`  ${index + 1}. ${apt.patientId?.name || 'N/A'} - ${new Date(apt.date).toLocaleDateString()} - ${apt.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the diagnostic
diagnoseAppointmentIssue();
