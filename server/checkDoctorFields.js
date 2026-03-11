const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  // Get one sexology doctor to check all fields
  const doctor = await User.findOne({ 
    role: 'doctor',
    'doctorDetails.specialization': 'Sexology'
  });
  
  if (doctor) {
    console.log('\n📋 DOCTOR PROFILE FIELDS CHECK');
    console.log('='.repeat(80));
    console.log('\n✅ POPULATED FIELDS:');
    console.log('Name:', doctor.name);
    console.log('Email:', doctor.email);
    console.log('Role:', doctor.role);
    console.log('IsActive:', doctor.isActive);
    console.log('ProfileImage:', doctor.profileImage || '(empty)');
    
    console.log('\n📝 Profile:');
    console.log('  Age:', doctor.profile?.age);
    console.log('  Gender:', doctor.profile?.gender);
    console.log('  Phone:', doctor.profile?.phone);
    console.log('  Address:', doctor.profile?.address);
    console.log('  BloodGroup:', doctor.profile?.bloodGroup);
    console.log('  EmergencyContact:', doctor.profile?.emergencyContact || '(empty)');
    
    console.log('\n👨‍⚕️ Doctor Details:');
    console.log('  Specialization:', doctor.doctorDetails?.specialization);
    console.log('  Experience:', doctor.doctorDetails?.experience);
    console.log('  Qualifications:', doctor.doctorDetails?.qualifications);
    console.log('  ClinicName:', doctor.doctorDetails?.clinicName);
    console.log('  ClinicAddress:', doctor.doctorDetails?.clinicAddress);
    console.log('  ClinicImages:', doctor.doctorDetails?.clinicImages?.length || 0, 'images');
    console.log('  ConsultationFee:', doctor.doctorDetails?.consultationFee);
    console.log('  Availability:', doctor.doctorDetails?.availability?.length || 0, 'days');
    console.log('  About:', doctor.doctorDetails?.about?.substring(0, 50) + '...');
    console.log('  Rating:', doctor.doctorDetails?.rating);
    console.log('  TotalReviews:', doctor.doctorDetails?.totalReviews);
    console.log('  Expertise.conditions:', doctor.doctorDetails?.expertise?.conditions?.length || 0);
    console.log('  Expertise.treatments:', doctor.doctorDetails?.expertise?.treatments?.length || 0);
    
    console.log('\n📍 Location:');
    console.log('  Type:', doctor.location?.type);
    console.log('  Coordinates:', doctor.location?.coordinates);
    
    console.log('\n❌ MISSING/EMPTY FIELDS:');
    const missing = [];
    if (!doctor.profileImage) missing.push('profileImage');
    if (!doctor.profile?.emergencyContact) missing.push('profile.emergencyContact');
    if (!doctor.doctorDetails?.clinicImages?.length) missing.push('doctorDetails.clinicImages');
    
    if (missing.length > 0) {
      missing.forEach(field => console.log('  -', field));
    } else {
      console.log('  None! All fields are populated.');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 SUMMARY:');
    console.log('Total doctors in DB:', await User.countDocuments({ role: 'doctor' }));
    console.log('Sexology doctors:', await User.countDocuments({ 
      role: 'doctor',
      'doctorDetails.specialization': 'Sexology'
    }));
  } else {
    console.log('No sexology doctor found!');
  }
  
  process.exit(0);
});
