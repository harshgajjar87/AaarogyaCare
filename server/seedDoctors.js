const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const doctors = [
  { name: 'Dr. Rajesh Kumar', email: 'rajesh.kumar@aarogyacare.com', specialization: 'Cardiology', experience: 15, qualifications: ['MBBS', 'MD Cardiology', 'DM'], fee: 800, phone: '9876543210', gender: 'male', age: 45 },
  { name: 'Dr. Priya Sharma', email: 'priya.sharma@aarogyacare.com', specialization: 'Dermatology', experience: 10, qualifications: ['MBBS', 'MD Dermatology'], fee: 600, phone: '9876543211', gender: 'female', age: 38 },
  { name: 'Dr. Amit Patel', email: 'amit.patel@aarogyacare.com', specialization: 'Orthopedics', experience: 12, qualifications: ['MBBS', 'MS Orthopedics'], fee: 700, phone: '9876543212', gender: 'male', age: 42 },
  { name: 'Dr. Sneha Reddy', email: 'sneha.reddy@aarogyacare.com', specialization: 'Pediatrics', experience: 8, qualifications: ['MBBS', 'MD Pediatrics'], fee: 500, phone: '9876543213', gender: 'female', age: 35 },
  { name: 'Dr. Vikram Singh', email: 'vikram.singh@aarogyacare.com', specialization: 'Neurology', experience: 18, qualifications: ['MBBS', 'MD Medicine', 'DM Neurology'], fee: 1000, phone: '9876543214', gender: 'male', age: 50 },
  { name: 'Dr. Anjali Mehta', email: 'anjali.mehta@aarogyacare.com', specialization: 'Gynecology', experience: 14, qualifications: ['MBBS', 'MS Gynecology'], fee: 700, phone: '9876543215', gender: 'female', age: 43 },
  { name: 'Dr. Suresh Iyer', email: 'suresh.iyer@aarogyacare.com', specialization: 'Ophthalmology', experience: 11, qualifications: ['MBBS', 'MS Ophthalmology'], fee: 600, phone: '9876543216', gender: 'male', age: 40 },
  { name: 'Dr. Kavita Desai', email: 'kavita.desai@aarogyacare.com', specialization: 'Psychiatry', experience: 9, qualifications: ['MBBS', 'MD Psychiatry'], fee: 800, phone: '9876543217', gender: 'female', age: 37 },
  { name: 'Dr. Arjun Nair', email: 'arjun.nair@aarogyacare.com', specialization: 'ENT', experience: 13, qualifications: ['MBBS', 'MS ENT'], fee: 650, phone: '9876543218', gender: 'male', age: 44 },
  { name: 'Dr. Meera Joshi', email: 'meera.joshi@aarogyacare.com', specialization: 'Endocrinology', experience: 10, qualifications: ['MBBS', 'MD Medicine', 'DM Endocrinology'], fee: 750, phone: '9876543219', gender: 'female', age: 39 },
  { name: 'Dr. Karan Malhotra', email: 'karan.malhotra@aarogyacare.com', specialization: 'Gastroenterology', experience: 16, qualifications: ['MBBS', 'MD Medicine', 'DM Gastroenterology'], fee: 900, phone: '9876543220', gender: 'male', age: 47 },
  { name: 'Dr. Pooja Gupta', email: 'pooja.gupta@aarogyacare.com', specialization: 'Pulmonology', experience: 7, qualifications: ['MBBS', 'MD Pulmonology'], fee: 700, phone: '9876543221', gender: 'female', age: 34 },
  { name: 'Dr. Rahul Verma', email: 'rahul.verma@aarogyacare.com', specialization: 'Urology', experience: 12, qualifications: ['MBBS', 'MS Urology'], fee: 750, phone: '9876543222', gender: 'male', age: 41 },
  { name: 'Dr. Divya Kapoor', email: 'divya.kapoor@aarogyacare.com', specialization: 'Rheumatology', experience: 9, qualifications: ['MBBS', 'MD Medicine', 'DM Rheumatology'], fee: 800, phone: '9876543223', gender: 'female', age: 36 },
  { name: 'Dr. Sanjay Rao', email: 'sanjay.rao@aarogyacare.com', specialization: 'Nephrology', experience: 14, qualifications: ['MBBS', 'MD Medicine', 'DM Nephrology'], fee: 850, phone: '9876543224', gender: 'male', age: 45 },
  { name: 'Dr. Nisha Agarwal', email: 'nisha.agarwal@aarogyacare.com', specialization: 'Oncology', experience: 11, qualifications: ['MBBS', 'MD Medicine', 'DM Oncology'], fee: 1200, phone: '9876543225', gender: 'female', age: 40 },
  { name: 'Dr. Manish Saxena', email: 'manish.saxena@aarogyacare.com', specialization: 'General Surgery', experience: 15, qualifications: ['MBBS', 'MS General Surgery'], fee: 700, phone: '9876543226', gender: 'male', age: 46 },
  { name: 'Dr. Ritu Bansal', email: 'ritu.bansal@aarogyacare.com', specialization: 'Radiology', experience: 8, qualifications: ['MBBS', 'MD Radiology'], fee: 600, phone: '9876543227', gender: 'female', age: 35 },
  { name: 'Dr. Anil Chopra', email: 'anil.chopra@aarogyacare.com', specialization: 'Anesthesiology', experience: 13, qualifications: ['MBBS', 'MD Anesthesiology'], fee: 650, phone: '9876543228', gender: 'male', age: 43 },
  { name: 'Dr. Swati Bhatt', email: 'swati.bhatt@aarogyacare.com', specialization: 'Pathology', experience: 10, qualifications: ['MBBS', 'MD Pathology'], fee: 500, phone: '9876543229', gender: 'female', age: 38 }
];

const cities = ['Ahmedabad', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad'];
const availability = [
  { day: 'Monday', startTime: '09:00', endTime: '17:00' },
  { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
  { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
  { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
  { day: 'Friday', startTime: '09:00', endTime: '17:00' },
  { day: 'Saturday', startTime: '10:00', endTime: '14:00' }
];

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const password = await bcrypt.hash('doctor123', 10);

    for (const doc of doctors) {
      const existingDoctor = await User.findOne({ email: doc.email });
      if (existingDoctor) {
        console.log(`⚠️  Doctor ${doc.name} already exists`);
        continue;
      }

      const city = cities[Math.floor(Math.random() * cities.length)];
      const lat = 23.0225 + (Math.random() - 0.5) * 0.5;
      const lng = 72.5714 + (Math.random() - 0.5) * 0.5;

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
          address: `${Math.floor(Math.random() * 500) + 1}, Medical Plaza, ${city}, Gujarat`,
          bloodGroup: ['A+', 'B+', 'O+', 'AB+'][Math.floor(Math.random() * 4)]
        },
        doctorDetails: {
          specialization: doc.specialization,
          experience: doc.experience,
          qualifications: doc.qualifications,
          clinicName: `${doc.name.split(' ')[1]} ${doc.specialization} Clinic`,
          clinicAddress: `${Math.floor(Math.random() * 500) + 1}, Medical Plaza, ${city}, Gujarat`,
          consultationFee: doc.fee,
          availability,
          about: `Experienced ${doc.specialization} specialist with ${doc.experience} years of practice. Dedicated to providing quality healthcare with compassion and expertise.`,
          rating: (4 + Math.random()).toFixed(1),
          totalReviews: Math.floor(Math.random() * 50) + 10,
          expertise: {
            conditions: [`${doc.specialization} disorders`, 'Preventive care', 'Treatment planning'],
            treatments: ['Consultation', 'Diagnosis', 'Treatment']
          }
        },
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      });

      await doctor.save();
      console.log(`✅ Created doctor: ${doc.name} (${doc.specialization})`);
    }

    console.log('\n🎉 Successfully seeded 20 doctors!');
    console.log('📝 All doctors have password: doctor123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    process.exit(1);
  }
};

seedDoctors();
