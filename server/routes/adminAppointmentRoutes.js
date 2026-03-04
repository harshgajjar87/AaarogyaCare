const express = require('express');
const router = express.Router();
const adminAppointmentController = require('../controllers/adminAppointmentController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/admin/appointments/export - Export appointments to Excel (must be before /:appointmentId)
router.get('/export', protect, admin, adminAppointmentController.exportAppointments);

// GET /api/admin/appointments - Get all appointments for admin panel
router.get('/', protect, admin, adminAppointmentController.getAllAdminAppointments);

// PUT /api/admin/appointments/:appointmentId/status - Update appointment status
router.put('/:appointmentId/status', protect, admin, adminAppointmentController.updateAppointmentStatus);

// DELETE /api/admin/appointments/:appointmentId - Delete appointment
router.delete('/:appointmentId', protect, admin, adminAppointmentController.deleteAppointment);

module.exports = router;
