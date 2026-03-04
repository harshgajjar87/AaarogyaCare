const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Appointment = require('./models/Appointment');
const User = require('./models/User');

dotenv.config();

const seedAppointments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Get all patients and doctors
    const patients = await User.find({ role: 'patient' }).limit(5);
    const doctors = await User.find({ role: 'doctor' }).limit(5);

    if (patients.length === 0) {
      console.log('❌ No patients found. Please create some patient accounts first.');
      process.exit(1);
    }

    if (doctors.length === 0) {
      console.log('❌ No doctors found. Please run seedDoctors.js first.');
      process.exit(1);
    }

    console.log(`Found ${patients.length} patients and ${doctors.length} doctors`);

    // Clear existing appointments (optional)
    const existingCount = await Appointment.countDocuments();
    console.log(`Found ${existingCount} existing appointments`);

    const statuses = ['pending', 'approved', 'rejected', 'paid', 'completed', 'visited'];
    const reasons = [
      'Regular checkup',
      'Follow-up consultation',
      'Fever and cold',
      'Back pain',
      'Skin rash',
      'Headache',
      'Stomach pain',
      'Annual health screening'
    ];

    const appointmentsToCreate = 10;
    let created = 0;

    for (let i = 0; i < appointmentsToCreate; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      
      // Generate random date within next 30 days
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));
      
      const hours = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
      const minutes = Math.random() > 0.5 ? '00' : '30';
      const time = `${hours.toString().padStart(2, '0')}:${minutes}`;

      // Ensure gender is capitalized to match enum values
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
        time: time,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        fees: doctor.doctorDetails?.consultationFee || 500,
        status: statuses[Math.floor(Math.random() * statuses.length)]
      });

      await appointment.save();
      created++;
      console.log(`✅ Created appointment ${created}: ${patient.name} → ${doctor.name} on ${date.toLocaleDateString()} at ${time}`);
    }

    console.log(`\n🎉 Successfully created ${created} appointments!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding appointments:', error);
    process.exit(1);
  }
};

seedAppointments();
