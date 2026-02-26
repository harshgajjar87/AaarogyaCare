# Seeded Doctors Reference

## Login Credentials
**Password for all doctors:** `doctor123`

## Doctor List (20 Doctors - All Specializations Covered)

| # | Name | Email | Specialization | Experience | Fee (₹) | Phone |
|---|------|-------|----------------|------------|---------|-------|
| 1 | Dr. Rajesh Kumar | rajesh.kumar@aarogyacare.com | Cardiology | 15 years | 800 | 9876543210 |
| 2 | Dr. Priya Sharma | priya.sharma@aarogyacare.com | Dermatology | 10 years | 600 | 9876543211 |
| 3 | Dr. Amit Patel | amit.patel@aarogyacare.com | Orthopedics | 12 years | 700 | 9876543212 |
| 4 | Dr. Sneha Reddy | sneha.reddy@aarogyacare.com | Pediatrics | 8 years | 500 | 9876543213 |
| 5 | Dr. Vikram Singh | vikram.singh@aarogyacare.com | Neurology | 18 years | 1000 | 9876543214 |
| 6 | Dr. Anjali Mehta | anjali.mehta@aarogyacare.com | Gynecology | 14 years | 700 | 9876543215 |
| 7 | Dr. Suresh Iyer | suresh.iyer@aarogyacare.com | Ophthalmology | 11 years | 600 | 9876543216 |
| 8 | Dr. Kavita Desai | kavita.desai@aarogyacare.com | Psychiatry | 9 years | 800 | 9876543217 |
| 9 | Dr. Arjun Nair | arjun.nair@aarogyacare.com | ENT | 13 years | 650 | 9876543218 |
| 10 | Dr. Meera Joshi | meera.joshi@aarogyacare.com | Endocrinology | 10 years | 750 | 9876543219 |
| 11 | Dr. Karan Malhotra | karan.malhotra@aarogyacare.com | Gastroenterology | 16 years | 900 | 9876543220 |
| 12 | Dr. Pooja Gupta | pooja.gupta@aarogyacare.com | Pulmonology | 7 years | 700 | 9876543221 |
| 13 | Dr. Rahul Verma | rahul.verma@aarogyacare.com | Urology | 12 years | 750 | 9876543222 |
| 14 | Dr. Divya Kapoor | divya.kapoor@aarogyacare.com | Rheumatology | 9 years | 800 | 9876543223 |
| 15 | Dr. Sanjay Rao | sanjay.rao@aarogyacare.com | Nephrology | 14 years | 850 | 9876543224 |
| 16 | Dr. Nisha Agarwal | nisha.agarwal@aarogyacare.com | Oncology | 11 years | 1200 | 9876543225 |
| 17 | Dr. Manish Saxena | manish.saxena@aarogyacare.com | General Surgery | 15 years | 700 | 9876543226 |
| 18 | Dr. Ritu Bansal | ritu.bansal@aarogyacare.com | Radiology | 8 years | 600 | 9876543227 |
| 19 | Dr. Anil Chopra | anil.chopra@aarogyacare.com | Anesthesiology | 13 years | 650 | 9876543228 |
| 20 | Dr. Swati Bhatt | swati.bhatt@aarogyacare.com | Pathology | 10 years | 500 | 9876543229 |

## Specializations Covered (20 Different)
1. Cardiology
2. Dermatology
3. Orthopedics
4. Pediatrics
5. Neurology
6. Gynecology
7. Ophthalmology
8. Psychiatry
9. ENT (Ear, Nose, Throat)
10. Endocrinology
11. Gastroenterology
12. Pulmonology
13. Urology
14. Rheumatology
15. Nephrology
16. Oncology
17. General Surgery
18. Radiology
19. Anesthesiology
20. Pathology

## Doctor Profile Details

Each doctor has:
- ✅ Complete profile information (age, gender, phone, address, blood group)
- ✅ Doctor-specific details (specialization, experience, qualifications)
- ✅ Clinic information (name, address)
- ✅ Consultation fees
- ✅ Availability schedule (Monday-Saturday)
- ✅ About section
- ✅ Random ratings (4.0-5.0) with review counts
- ✅ Expertise areas (conditions and treatments)
- ✅ Geographic location coordinates (around Ahmedabad area)

## Availability Schedule
All doctors are available:
- **Monday to Friday:** 9:00 AM - 5:00 PM
- **Saturday:** 10:00 AM - 2:00 PM
- **Sunday:** Closed

## How to Login
1. Go to login page
2. Use any email from the list above
3. Password: `doctor123`
4. Access doctor dashboard and analytics

## Re-running the Seed Script
To add these doctors again (if database is reset):
```bash
cd server
node seedDoctors.js
```

The script will skip doctors that already exist in the database.
