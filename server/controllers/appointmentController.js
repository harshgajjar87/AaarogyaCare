const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Chat = require('../models/Chat');
const transporter = require('../config/mail');

const ExcelJS = require('exceljs');

// ✅ NEW: Export Appointments to Excel
exports.exportAppointmentsToExcel = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email profile.phone')
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Appointments');

    // Define columns
    worksheet.columns = [
      { header: 'Patient Name', key: 'patientName', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Doctor', key: 'doctor', width: 30 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Time', key: 'time', width: 15 },
      { header: 'Reason', key: 'reason', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    // Add rows
    appointments.forEach(appointment => {
      worksheet.addRow({
        patientName: appointment.patientId.name,
        email: appointment.patientId.email,
        phone: appointment.patientId.profile.phone,
        doctor: appointment.doctorId.name,
        date: appointment.date.toLocaleDateString(),
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status,
      });
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=appointments.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ msg: 'Error exporting appointments', error: err.message });
  }
};
exports.createAppointment = async (req, res) => {
  try {
    const { name, age, gender, date, time, reason, doctorId } = req.body;
    const patientId = req.user._id;

    const appointment = new Appointment({
      patientId,
      doctorId,
      name,
      age,
      gender,
      date,
      time,
      reason
    });

    await appointment.save();

    // Create notification for the selected doctor
    if (doctorId) {
      await Notification.create({
        userId: doctorId,
        message: `New appointment requested by ${name} on ${date} at ${time}`
      });
    }

    res.status(201).json({ msg: 'Appointment Requested', appointment });
  } catch (err) {
    res.status(500).json({ msg: 'Error creating appointment', error: err.message });
  }
};

// ✅ Doctor: View Appointments Assigned to Specific Doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email profile.phone')
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch appointments', error: err.message });
  }
};

// ✅ Doctor: View Pending Appointments for Specific Doctor
exports.getDoctorPendingAppointments = async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    const appointments = await Appointment.find({ 
      doctorId, 
      status: 'pending' 
    })
      .populate('patientId', 'name email profile.phone')
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch pending appointments', error: err.message });
  }
};

// ✅ Doctor: Approve Appointment
exports.approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patientId');
    if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

    // Authorization check: Ensure only assigned doctor can approve
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to approve this appointment' });
    }

    appointment.status = 'approved';

    // Enable chat for the approved appointment
    appointment.chatEnabled = true;
    appointment.chatCreatedAt = new Date();

    // Set chat expiration to 5 days from now
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 5);
    appointment.chatExpiresAt = expirationDate;

    await appointment.save();

    // Create a chat for the approved appointment - check if it already exists first
    try {
      const existingChat = await Chat.findOne({ appointmentId: appointment._id });
      
      if (!existingChat) {
        const chat = new Chat({
          appointmentId: appointment._id,
          patientId: appointment.patientId._id,
          doctorId: appointment.doctorId,
          isActive: true
        });
        await chat.save();

        // Create notifications for both patient and doctor
        await Notification.create({
          userId: appointment.patientId._id,
          message: `You can now chat with Dr. ${appointment.doctorId.name} about your appointment`
        });

        await Notification.create({
          userId: appointment.doctorId,
          message: `You can now chat with ${appointment.patientId.name} about your appointment`
        });
        
        console.log(`✅ Chat created successfully for appointment: ${appointment._id}`);
      } else {
        console.log(`ℹ️ Chat already exists for appointment: ${appointment._id}`);
      }
    } catch (chatErr) {
      console.error('❌ Error creating chat for approved appointment:', chatErr);
      // Don't fail the entire approval process if chat creation fails
      // The automatic chat access in chatController will handle it later
    }

    // Send email notification (if email is configured)
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      try {
        const mailOptions = {
          from: process.env.MAIL_USER,
          to: appointment.patientId.email,
          subject: 'Appointment Approved',
          html: `
            <p>Dear ${appointment.patientId.name},</p>
            <p>Your appointment on <strong>${appointment.date.toDateString()}</strong> at <strong>${appointment.time}</strong> has been <strong>approved</strong>.</p>
            <p>You can now chat with your doctor to discuss your appointment details.</p>
          `
        };
        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error('Failed to send approval email:', emailErr);
      }
    } else {
      console.log('Email not configured, skipping approval email notification');
    }

    res.json({ 
      msg: 'Appointment Approved & Chat Created', 
      chatEnabled: true,
      chatExpiresAt: expirationDate
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error approving appointment', error: err.message });
  }
};

// ✅ Doctor: Reject Appointment
exports.rejectAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patientId');
    if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

    // Authorization check: Ensure only assigned doctor can reject
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to reject this appointment' });
    }

    appointment.status = 'rejected';
    await appointment.save();

    // Send email notification (if email is configured)
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      try {
        const mailOptions = {
          from: process.env.MAIL_USER,
          to: appointment.patientId.email,
          subject: 'Appointment Rejected',
          html: `
            <p>Dear ${appointment.patientId.name},</p>
            <p>We regret to inform you that your appointment on <strong>${appointment.date.toDateString()}</strong> at <strong>${appointment.time}</strong> has been <strong>rejected</strong>.</p>
          `
        };
        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error('Failed to send rejection email:', emailErr);
      }
    } else {
      console.log('Email not configured, skipping rejection email notification');
    }

    res.json({ msg: 'Appointment Rejected & Mail Sent' });
  } catch (err) {
    res.status(500).json({ msg: 'Error rejecting appointment', error: err.message });
  }
};

// ✅ Patient: View Their Own Appointments
exports.getAppointmentsByPatientId = async (req, res) => {
  try {
    console.log("🔍 Request received for patient ID:", req.params.id);

    if (!req.params.id) {
      console.error("❌ No patient ID in req.params");
      return res.status(400).json({ msg: "Missing patient ID" });
    }

    const appointments = await Appointment.find({ patientId: req.params.id })
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 });

    console.log("✅ Appointments fetched:", appointments.length);
    res.json(appointments);
  } catch (err) {
    console.error("❌ Backend 500 error:", err);
    res.status(500).json({ msg: "Error fetching appointments", error: err.message });
  }
};

// ✅ Doctor: Get All Appointments Assigned to the Logged-in Doctor (for dashboard)
exports.getAllAppointments = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email profile.phone')
      .populate('doctorId', 'name email profile.phone')
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching appointments', error: err.message });
  }
};

// ✅ Get unique patients who have had appointments with the doctor
exports.getDoctorPatients = async (req, res) => {
  try {
    // Get doctorId from URL parameter if provided, otherwise use authenticated user's ID
    const doctorId = req.params.doctorId || req.user._id;
    
    // 获取所有状态（包括pending, approved, rejected等）的预约
    const appointments = await Appointment.find({
      doctorId
    }).populate('patientId', 'name email profile phone');

    // 获取唯一的患者
    const patients = [];
    const patientIds = new Set();
    
    // 计算每个患者的预约次数和最后一次预约日期
    const patientStats = {};
    
    appointments.forEach(appointment => {
      const patientId = appointment.patientId._id.toString();
      
      if (!patientIds.has(patientId)) {
        patients.push(appointment.patientId);
        patientIds.add(patientId);
      }
      
      // 初始化患者统计信息
      if (!patientStats[patientId]) {
        patientStats[patientId] = {
          appointmentCount: 0,
          lastAppointmentDate: appointment.date
        };
      }
      
      // 更新预约次数
      patientStats[patientId].appointmentCount++;
      
      // 更新最后一次预约日期
      if (appointment.date > patientStats[patientId].lastAppointmentDate) {
        patientStats[patientId].lastAppointmentDate = appointment.date;
      }
    });

    const patientData = patients.map(patient => {
        const stats = patientStats[patient._id.toString()];
        return {
            ...patient.toObject(),
            appointmentCount: stats ? stats.appointmentCount : 0,
            lastAppointmentDate: stats ? stats.lastAppointmentDate : null
        };
    });

    res.json(patientData);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching doctor patients', error: err.message });
  }
};

// ✅ NEW: Get available time slots for a specific date and doctor
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    
    if (!doctorId || !date) {
      return res.status(400).json({ msg: 'Doctor ID and date are required' });
    }

    // Get doctor details
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    // Get day of week from date
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Find doctor's availability for this day
    const availability = doctor.doctorDetails?.availability?.find(
      slot => slot.day === dayOfWeek
    );

    if (!availability) {
      return res.json({ availableSlots: [], message: 'Doctor not available on this day' });
    }

    // Get already booked slots for this date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['pending', 'approved'] }
    });

    const bookedSlots = bookedAppointments.map(apt => apt.time);

    // Generate available slots
    const availableSlots = [];
    const [startHour, startMinute] = availability.startTime.split(':').map(Number);
    const [endHour, endMinute] = availability.endTime.split(':').map(Number);

    // Generate 30-minute intervals
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === endHour && minute >= endMinute) break;

        const slotHour = hour < 10 ? `0${hour}` : `${hour}`;
        const slotMinute = minute < 10 ? `0${minute}` : `${minute}`;
        const slotTime = `${slotHour}:${slotMinute}`;

        // Only add if not already booked
        if (!bookedSlots.includes(slotTime)) {
          availableSlots.push(slotTime);
        }
      }
    }

    res.json({ 
      availableSlots, 
      dayOfWeek, 
      availability: {
        startTime: availability.startTime,
        endTime: availability.endTime
      }
    });

  } catch (err) {
    res.status(500).json({ msg: 'Error fetching available slots', error: err.message });
  }
};

// ✅ Patient: Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patientId doctorId');
    if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

    // Authorization check: Ensure only the patient who created the appointment can cancel it
    if (appointment.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to cancel this appointment' });
    }

    // Check if appointment is already cancelled
    if (appointment.status === 'cancelled' || appointment.status === 'cancelled-by-patient') {
      return res.status(400).json({ msg: 'Appointment is already cancelled' });
    }

    appointment.status = 'cancelled-by-patient';
    await appointment.save();

    // Create notification for the doctor
    await Notification.create({
      userId: appointment.doctorId._id,
      message: `Appointment cancelled by ${appointment.patientId.name} for ${appointment.date.toDateString()} at ${appointment.time}`
    });

    // Send email notification to doctor (if email is configured)
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      try {
        const doctorMailOptions = {
          from: process.env.MAIL_USER,
          to: appointment.doctorId.email,
          subject: 'Appointment Cancelled',
          html: `
            <p>Dear Dr. ${appointment.doctorId.name},</p>
            <p>The appointment scheduled for <strong>${appointment.date.toDateString()}</strong> at <strong>${appointment.time}</strong> has been <strong>cancelled</strong> by the patient.</p>
            <p>Patient: ${appointment.patientId.name}</p>
          `
        };
        await transporter.sendMail(doctorMailOptions);
      } catch (emailErr) {
        console.error('Failed to send email to doctor:', emailErr);
      }
    } else {
      console.log('Email not configured, skipping email notification to doctor');
    }

    // Send email confirmation to patient (if email is configured)
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      try {
        const patientMailOptions = {
          from: process.env.MAIL_USER,
          to: appointment.patientId.email,
          subject: 'Appointment Cancelled',
          html: `
            <p>Dear ${appointment.patientId.name},</p>
            <p>Your appointment with Dr. ${appointment.doctorId.name} on <strong>${appointment.date.toDateString()}</strong> at <strong>${appointment.time}</strong> has been successfully <strong>cancelled</strong>.</p>
          `
        };
        await transporter.sendMail(patientMailOptions);
      } catch (emailErr) {
        console.error('Failed to send email to patient:', emailErr);
      }
    } else {
      console.log('Email not configured, skipping email notification to patient');
    }

    res.json({ msg: 'Appointment cancelled successfully', appointment });
  } catch (err) {
    res.status(500).json({ msg: 'Error cancelling appointment', error: err.message });
  }
};
