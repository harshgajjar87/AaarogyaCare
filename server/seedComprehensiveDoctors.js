const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

// Comprehensive list of specializations
const specializations = [
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Neurology',
  'Gynecology',
  'Ophthalmology',
  'Psychiatry',
  'ENT',
  'Endocrinology',
  'Gastroenterology',
  'Pulmonology',
  'Urology',
  'Rheumatology',
  'Nephrology',
  'Oncology',
  'General Surgery',
  'Radiology',
  'Anesthesiology',
  'Pathology',
  'Sexology',
  'General Physician',
  'Dentistry',
  'Physiotherapy'
];

// Indian first names
const maleFirstNames = ['Rajesh', 'Amit', 'Vikram', 'Suresh', 'Arjun', 'Karan', 'Rahul', 'Sanjay', 'Manish', 'Anil', 'Ravi', 'Deepak', 'Nitin', 'Ashok', 'Prakash', 'Vinod', 'Ajay', 'Manoj', 'Ramesh', 'Sandeep'];
const femaleFirstNames = ['Priya', 'Sneha', 'Anjali', 'Kavita', 'Meera', 'Pooja', 'Divya', 'Nisha', 'Ritu', 'Swati', 'Neha', 'Anita', 'Sunita', 'Rekha', 'Geeta', 'Shalini', 'Preeti', 'Madhuri', 'Shweta', 'Aarti'];
const lastNames = ['Kumar', 'Sharma', 'Patel', 'Reddy', 'Singh', 'Mehta', 'Iyer', 'Desai', 'Nair', 'Joshi', 'Malhotra', 'Gupta', 'Verma', 'Kapoor', 'Rao', 'Agarwal', 'Saxena', 'Bansal', 'Chopra', 'Bhatt', 'Shah', 'Mishra', 'Pandey', 'Sinha', 'Kulkarni'];

const cities = ['Ahmedabad', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Jaipur', 'Surat'];

const availability = [
  { day: 'Monday', startTime: '09:00', endTime: '17:00' },
  { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
  { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
  { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
  { day: 'Friday', startTime: '09:00', endTime: '17:00' },
  { day: 'Saturday', startTime: '10:00', endTime: '14:00' }
];

// Specialization-specific qualifications
const specializationQualifications = {
  'Cardiology': ['MBBS', 'MD Medicine', 'DM Cardiology'],
  'Dermatology': ['MBBS', 'MD Dermatology'],
  'Orthopedics': ['MBBS', 'MS Orthopedics'],
  'Pediatrics': ['MBBS', 'MD Pediatrics'],
  'Neurology': ['MBBS', 'MD Medicine', 'DM Neurology'],
  'Gynecology': ['MBBS', 'MS Gynecology', 'DNB'],
  'Ophthalmology': ['MBBS', 'MS Ophthalmology'],
  'Psychiatry': ['MBBS', 'MD Psychiatry'],
  'ENT': ['MBBS', 'MS ENT'],
  'Endocrinology': ['MBBS', 'MD Medicine', 'DM Endocrinology'],
  'Gastroenterology': ['MBBS', 'MD Medicine', 'DM Gastroenterology'],
  'Pulmonology': ['MBBS', 'MD Pulmonology'],
  'Urology': ['MBBS', 'MS Urology', 'MCh Urology'],
  'Rheumatology': ['MBBS', 'MD Medicine', 'DM Rheumatology'],
  'Nephrology': ['MBBS', 'MD Medicine', 'DM Nephrology'],
  'Oncology': ['MBBS', 'MD Medicine', 'DM Oncology'],
  'General Surgery': ['MBBS', 'MS General Surgery'],
  'Radiology': ['MBBS', 'MD Radiology'],
  'Anesthesiology': ['MBBS', 'MD Anesthesiology'],
  'Pathology': ['MBBS', 'MD Pathology'],
  'Sexology': ['MBBS', 'MD Psychiatry', 'Fellowship in Sexual Medicine'],
  'General Physician': ['MBBS', 'MD Medicine'],
  'Dentistry': ['BDS', 'MDS'],
  'Physiotherapy': ['BPT', 'MPT']
};

// Fee ranges by specialization
const feeRanges = {
  'Cardiology': [800, 1200],
  'Dermatology': [500, 800],
  'Orthopedics': [600, 900],
  'Pediatrics': [400, 700],
  'Neurology': [900, 1500],
  'Gynecology': [600, 900],
  'Ophthalmology': [500, 800],
  'Psychiatry': [700, 1000],
  'ENT': [500, 800],
  'Endocrinology': [700, 1000],
  'Gastroenterology': [800, 1200],
  'Pulmonology': [600, 900],
  'Urology': [700, 1000],
  'Rheumatology': [700, 1000],
  'Nephrology': [800, 1200],
  'Oncology': [1000, 1800],
  'General Surgery': [600, 1000],
  'Radiology': [500, 800],
  'Anesthesiology': [600, 900],
  'Pathology': [400, 700],
  'Sexology': [800, 1200],
  'General Physician': [300, 600],
  'Dentistry': [400, 800],
  'Physiotherapy': [400, 700]
};

// Generate random doctor data
function generateDoctor(specialization, index) {
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const firstName = gender === 'male' 
    ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
    : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `Dr. ${firstName} ${lastName}`;
  
  const experience = Math.floor(Math.random() * 20) + 5; // 5-25 years
  const age = 28 + experience; // Age based on experience
  
  const city = cities[Math.floor(Math.random() * cities.length)];
  const lat = 23.0225 + (Math.random() - 0.5) * 2; // Spread across India
  const lng = 72.5714 + (Math.random() - 0.5) * 10;
  
  const feeRange = feeRanges[specialization] || [500, 800];
  const fee = Math.floor(Math.random() * (feeRange[1] - feeRange[0]) + feeRange[0]);
  
  const qualifications = specializationQualifications[specialization] || ['MBBS', 'MD'];
  
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${specialization.toLowerCase().replace(/\s+/g, '')}${index}@aarogyacare.com`;
  const phone = `98765${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
  
  return {
    name,
    email,
    gender,
    age,
    experience,
    qualifications,
    fee,
    phone,
    city,
    lat,
    lng,
    specialization
  };
}

const seedComprehensiveDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const password = await bcrypt.hash('doctor123', 10);
    let totalCreated = 0;
    let totalSkipped = 0;

    console.log('\n🏥 Starting comprehensive doctor seeding...\n');

    for (const specialization of specializations) {
      const doctorCount = Math.floor(Math.random() * 3) + 4; // 4-6 doctors per specialization
      console.log(`\n📋 Creating ${doctorCount} doctors for ${specialization}...`);

      for (let i = 0; i < doctorCount; i++) {
        const doc = generateDoctor(specialization, i + 1);

        // Check if doctor already exists
        const existingDoctor = await User.findOne({ email: doc.email });
        if (existingDoctor) {
          console.log(`   ⚠️  ${doc.name} already exists`);
          totalSkipped++;
          continue;
        }

        const doctor = new User({
          name: doc.name,
          email: doc.email,
          password,
          role: 'doctor',
          isActive: true,
          profile: {
            age: doc.age,
            gender: doc.gender,
            phone: doc.phone,
            address: `${Math.floor(Math.random() * 500) + 1}, Medical Plaza, ${doc.city}, India`,
            bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][Math.floor(Math.random() * 8)]
          },
          doctorDetails: {
            specialization: doc.specialization,
            experience: doc.experience,
            qualifications: doc.qualifications,
            clinicName: `${doc.name.split(' ')[1]} ${doc.specialization} Clinic`,
            clinicAddress: `${Math.floor(Math.random() * 500) + 1}, Medical Plaza, ${doc.city}, India`,
            consultationFee: doc.fee,
            availability,
            about: `Experienced ${doc.specialization} specialist with ${doc.experience} years of practice. Dedicated to providing quality healthcare with compassion and expertise. Committed to patient-centered care and evidence-based treatment approaches.`,
            rating: parseFloat((4 + Math.random()).toFixed(1)),
            totalReviews: Math.floor(Math.random() * 100) + 10,
            expertise: {
              conditions: [
                `${doc.specialization} disorders`,
                'Preventive care',
                'Treatment planning',
                'Patient counseling'
              ],
              treatments: [
                'Consultation',
                'Diagnosis',
                'Treatment',
                'Follow-up care'
              ]
            }
          },
          location: {
            type: 'Point',
            coordinates: [doc.lng, doc.lat]
          }
        });

        await doctor.save();
        console.log(`   ✅ ${doc.name} (${doc.experience}y exp, ₹${doc.fee})`);
        totalCreated++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🎉 Seeding completed successfully!`);
    console.log(`✅ Created: ${totalCreated} doctors`);
    console.log(`⚠️  Skipped: ${totalSkipped} doctors (already exist)`);
    console.log(`📊 Total specializations: ${specializations.length}`);
    console.log(`🔑 All doctors have password: doctor123`);
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    process.exit(1);
  }
};

seedComprehensiveDoctors();
