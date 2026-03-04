const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Appointment = require('./models/Appointment');
const User = require('./models/User');

dotenv.config();

const addMoreAppointments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const patients = await User.find({ role: 'patient' }).limit(5);
    const doctors = await User.find({ role: 'doctor' }).limit(10);

    if (patients.length === 0 || doctors.length === 0) {
      console.log('❌ Need at least 1 patient and 1 doctor');
      process.exit(1);
    }

    const statuses = ['pending', 'approved', 'rejected', 'paid', 'visited'];
    const reasons = [
      'Regular checkup',
      'Follow-up consultation',
      'Fever and cold',
      'Back pain',
      'Skin rash',
      'Headache',
      'Stomach pain',
      'Annual health screening',
      'Vaccination',
      'Blood test results review'
    ];

    const appointmentsData = [
      { daysFromNow: 1, status: 'pending', time: '10:00' },
      { daysFromNow: 2, status: 'approved', time: '11:30' },
      { daysFromNow: 3, status: 'pending', time: '14:00' },
      { daysFromNow: 5, status: 'paid', time: '09:00' },
      { daysFromNow: 7, status: 'approved', time: '15:30' },
      { daysFromNow: 10, status: 'rejected', time: '16:00' },
      { daysFromNow: 12, status: 'visited', time: '10:30' },
    ];

    let created = 0;

    for (const aptData of appointmentsData) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      
      const date = new Date();
      date.setDate(date.getDate() + aptData.daysFromNow);

      // Ensure gender is capitalized
      let gender = patient.profile?.gender || 'Male';
      if (gender === 'male') gender = 'Male';
      if (gender === 'female') gender = 'Female';
      if (gender === 'other') gender = 'Other';

      const appointment = new Appointment({
        patientId: patient._id,
        doctorId: doctor._id,
        name: patient.name,
        age: patient.profile?.age || 30,
        gender: gender,
        date: date,
        time: aptData.time,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        fees: doctor.doctorDetails?.consultationFee || 500,
        status: aptData.status
      });

      await appointment.save();
      created++;
      console.log(`✅ Created ${aptData.status} appointment: ${patient.name} → ${doctor.name} on ${date.toLocaleDateString()} at ${aptData.time}`);
    }

    console.log(`\n🎉 Successfully created ${created} more appointments!`);
    console.log('Now you have appointments with various statuses: pending, approved, rejected, paid, visited, completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addMoreAppointments();
