const Appointment = require('../models/Appointment');
const User = require('../models/User');
const ExcelJS = require('exceljs');

// Get all appointments for admin panel with specific statuses
exports.getAllAdminAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      status: { $in: ['approved', 'rejected', 'pending', 'cancelled-by-patient'] }
    })
    .populate('patientId', 'name email profile.phone')
    .populate('doctorId', 'name email profile.phone profile.specialization')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      msg: 'Error fetching admin appointments', 
      error: err.message 
    });
  }
};

// Update appointment status (for admin)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const validStatuses = ['approved', 'rejected', 'pending', 'cancelled-by-patient'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid status. Must be one of: approved, rejected, pending, cancelled-by-patient'
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        msg: 'Appointment not found'
      });
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      success: true,
      msg: 'Appointment status updated successfully',
      data: appointment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: 'Error updating appointment status',
      error: err.message
    });
  }
};

// Export appointments to Excel (for admin)
exports.exportAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      status: { $in: ['approved', 'rejected', 'pending', 'cancelled-by-patient'] }
    })
    .populate('patientId', 'name email profile.phone')
    .populate('doctorId', 'name email profile.phone profile.specialization');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Appointments');

    worksheet.columns = [
      { header: 'ID', key: '_id', width: 30 },
      { header: 'Patient Name', key: 'patientName', width: 20 },
      { header: 'Doctor Name', key: 'doctorName', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Time', key: 'time', width: 10 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Reason', key: 'reason', width: 30 },
      { header: 'Patient Email', key: 'patientEmail', width: 25 },
      { header: 'Doctor Email', key: 'doctorEmail', width: 25 },
      { header: 'Specialization', key: 'specialization', width: 20 }
    ];

    appointments.forEach(appointment => {
      worksheet.addRow({
        _id: appointment._id,
        patientName: appointment.patientId?.name || 'Unknown',
        doctorName: appointment.doctorId?.name || 'Unknown',
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        reason: appointment.reason || 'N/A',
        patientEmail: appointment.patientId?.email || 'N/A',
        doctorEmail: appointment.doctorId?.email || 'N/A',
        specialization: appointment.doctorId?.profile?.specialization || 'N/A'
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };

    res.setHeader('Content-Disposition', 'attachment; filename=appointments_export.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      msg: 'Error exporting appointments', 
      error: err.message 
    });
  }
};

// Delete appointment (for admin)
exports.deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        msg: 'Appointment not found'
      });
    }

    await Appointment.findByIdAndDelete(appointmentId);

    res.json({
      success: true,
      msg: 'Appointment deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: 'Error deleting appointment',
      error: err.message
    });
  }
};
