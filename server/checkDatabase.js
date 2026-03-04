const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

dotenv.config();

const checkDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Check users
    const totalUsers = await User.countDocuments();
    const patients = await User.countDocuments({ role: 'patient' });
    const doctors = await User.countDocuments({ role: 'doctor' });
    const pendingDoctors = await User.countDocuments({ role: 'pending_doctor' });
    const admins = await User.countDocuments({ role: 'admin' });

    console.log('👥 USERS:');
    console.log(`   Total: ${totalUsers}`);
    console.log(`   Patients: ${patients}`);
    console.log(`   Doctors: ${doctors}`);
    console.log(`   Pending Doctors: ${pendingDoctors}`);
    console.log(`   Admins: ${admins}\n`);

    // Check appointments
    const totalAppointments = await Appointment.countDocuments();
    const pending = await Appointment.countDocuments({ status: 'pending' });
    const approved = await Appointment.countDocuments({ status: 'approved' });
    const rejected = await Appointment.countDocuments({ status: 'rejected' });
    const paid = await Appointment.countDocuments({ status: 'paid' });
    const completed = await Appointment.countDocuments({ status: 'completed' });
    const visited = await Appointment.countDocuments({ status: 'visited' });

    console.log('📅 APPOINTMENTS:');
    console.log(`   Total: ${totalAppointments}`);
    console.log(`   Pending: ${pending}`);
    console.log(`   Approved: ${approved}`);
    console.log(`   Rejected: ${rejected}`);
    console.log(`   Paid: ${paid}`);
    console.log(`   Completed: ${completed}`);
    console.log(`   Visited: ${visited}\n`);

    if (totalAppointments > 0) {
      console.log('📋 Sample Appointments:');
      const sampleAppointments = await Appointment.find()
        .populate('patientId', 'name email')
        .populate('doctorId', 'name email')
        .limit(3);
      
      sampleAppointments.forEach((apt, idx) => {
        console.log(`   ${idx + 1}. ${apt.patientId?.name || 'Unknown'} → ${apt.doctorId?.name || 'Unknown'}`);
        console.log(`      Date: ${apt.date.toLocaleDateString()} at ${apt.time}`);
        console.log(`      Status: ${apt.status}\n`);
      });
    }

    // Check if admin exists
    if (admins === 0) {
      console.log('⚠️  WARNING: No admin user found!');
      console.log('   You need to create an admin user to access the admin panel.\n');
    } else {
      const adminUsers = await User.find({ role: 'admin' }).select('name email');
      console.log('👑 ADMIN USERS:');
      adminUsers.forEach(admin => {
        console.log(`   - ${admin.name} (${admin.email})`);
      });
      console.log();
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
};

checkDatabase();
