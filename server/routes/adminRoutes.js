const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getTotalPatients,
  getTotalDoctors,
  getTotalAppointments,
  getDoctorsBySpecialization,
  getAppointmentsByDoctor,
  getAllPatients,
  getAllDoctors,
  getAllAppointments,
  togglePatientActiveStatus,
  getQueries,
  replyToQuery
} = require('../controllers/adminController');

// All routes require authentication and admin privileges
router.use(protect, admin);

// Dashboard statistics routes
router.get('/patients/count', getTotalPatients);
router.get('/doctors/count', getTotalDoctors);
router.get('/appointments/count', getTotalAppointments);
router.get('/doctors/by-specialization', getDoctorsBySpecialization);
router.get('/appointments/by-doctor', getAppointmentsByDoctor);

// Management routes
router.get('/patients', getAllPatients);
router.get('/doctors', getAllDoctors);
router.get('/appointments', getAllAppointments);
router.patch('/patients/:id/toggle-active', togglePatientActiveStatus);

// Queries routes
router.get('/queries', getQueries);
router.post('/queries/:id/reply', replyToQuery);

// One-time utility: normalize doctor specialization spellings in DB
// Merges "ology" and misspelled variants → canonical "ologist" form
router.post('/normalize-specializations', async (req, res) => {
  const User = require('../models/User');
  const { SPEC_CORRECTIONS } = require('../utils/normalizeSpecialization');

  try {
    const doctors = await User.find({ role: 'doctor', 'doctorDetails.specialization': { $exists: true } })
      .select('name doctorDetails.specialization');

    let updated = 0;
    for (const doc of doctors) {
      const current = doc.doctorDetails?.specialization;
      if (!current) continue;
      for (const { pattern, canonical } of SPEC_CORRECTIONS) {
        if (pattern.test(current) && current !== canonical) {
          await User.updateOne({ _id: doc._id }, { $set: { 'doctorDetails.specialization': canonical } });
          console.log(`Normalized: "${current}" → "${canonical}" for ${doc.name}`);
          updated++;
          break;
        }
      }
    }
    res.json({ message: `Normalized ${updated} doctor records.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
