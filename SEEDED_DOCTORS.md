# Seeded Doctors Database

## Overview
The database now contains **149 doctors** across **28 specializations**, including Sexology.

## Specializations Coverage
Each specialization has 4-6 doctors (randomly assigned) to provide realistic variety for the project.

### Complete Specialization List:
1. Anesthesiology (6 doctors)
2. Cardiology (7 doctors)
3. Dentistry (6 doctors)
4. Dermatology (5 doctors)
5. ENT (6 doctors)
6. Endocrinology (5 doctors)
7. Gastroenterology (5 doctors)
8. General Physician (6 doctors)
9. General Surgery (7 doctors)
10. Gynecology (5 doctors)
11. Nephrology (6 doctors)
12. Neurology (6 doctors)
13. Oncology (6 doctors)
14. Ophthalmology (6 doctors)
15. Orthopedics (5 doctors)
16. Pathology (7 doctors)
17. Pediatrics (7 doctors)
18. Physiotherapy (6 doctors)
19. Psychiatry (6 doctors)
20. Pulmonology (5 doctors)
21. Radiology (7 doctors)
22. Rheumatology (6 doctors)
23. **Sexology (6 doctors)** ✨ NEW
24. Urology (7 doctors)

## Login Credentials
- **Email Format**: `firstname.lastname.specialization@aarogyacare.com`
- **Password**: `doctor123` (for all doctors)

## Sexology Doctors (Newly Added)
1. Dr. Preeti Gupta - 15y exp - ₹865 - preeti.gupta.sexology1@aarogyacare.com
2. Dr. Aarti Kulkarni - 23y exp - ₹1001 - aarti.kulkarni.sexology2@aarogyacare.com
3. Dr. Aarti Sinha - 5y exp - ₹866 - aarti.sinha.sexology3@aarogyacare.com
4. Dr. Karan Chopra - 12y exp - ₹1176 - karan.chopra.sexology4@aarogyacare.com
5. Dr. Shalini Iyer - 13y exp - ₹895 - shalini.iyer.sexology5@aarogyacare.com
6. Dr. Shweta Kumar - 5y exp - ₹1061 - shweta.kumar.sexology6@aarogyacare.com

## Doctor Features
Each doctor has:
- ✅ Unique name and email
- ✅ Realistic experience (5-25 years)
- ✅ Specialization-appropriate qualifications
- ✅ Consultation fees based on specialization
- ✅ Clinic details and location
- ✅ Availability schedule (Mon-Sat)
- ✅ Rating (4.0-5.0)
- ✅ Professional bio and expertise

## How to Use

### View All Doctors
```bash
cd server
node listDoctors.js
```

### Seed More Doctors
```bash
cd server
node seedComprehensiveDoctors.js
```

### Login as Any Doctor
1. Go to login page
2. Use email: `[doctor-email]@aarogyacare.com`
3. Password: `doctor123`

## Notes
- All doctors are active and verified
- Doctors are distributed across major Indian cities
- Each doctor has geolocation coordinates for map features
- Consultation fees vary by specialization (₹300-₹1800)
- All doctors have Monday-Saturday availability
