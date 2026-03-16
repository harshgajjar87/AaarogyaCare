const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Chat = require('../models/Chat');
const transporter = require('../config/mail');
const { generateReceiptPDF } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

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
    // This function is now only used for creating appointments without payment
    // For paid appointments, use the payment verification endpoint
    const { name, age, gender, date, time, reason, doctorId, fees } = req.body;
    const patientId = req.user._id;

    // Validate that the date is not in the past
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({ msg: 'Cannot book appointments for past dates' });
    }

    // Get doctor details to fetch consultation fee
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    // Check if the time slot is already booked
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      time,
      status: { $nin: ['cancelled', 'cancelled-by-patient', 'rejected'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ msg: 'This time slot is already booked. Please select another time.' });
    }

    const appointment = new Appointment({
      patientId,
      doctorId,
      name,
      age,
      gender,
      date,
      time,
      reason,
      fees: fees || doctor.doctorDetails.consultationFee || 0
    });

    await appointment.save();

    // Create notification for the selected doctor
    if (doctorId) {
      await Notification.create({
        userId: doctorId,
        message: `New appointment requested by ${name} on ${date} at ${time}`
      });
    }

    // Send confirmation email with PDF receipt to patient
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      try {
        // Populate patient and doctor details for PDF
        const populatedAppointment = await Appointment.findById(appointment._id)
          .populate('patientId', 'name email profile')
          .populate('doctorId', 'name doctorDetails');

        // Generate PDF receipt
        const receiptFileName = await generateReceiptPDF(
          populatedAppointment,
          populatedAppointment.patientId,
          populatedAppointment.doctorId
        );
        const receiptPath = path.join(__dirname, '../uploads', receiptFileName);

        // Send email with PDF attachment
        const mailOptions = {
          from: process.env.MAIL_USER,
          to: populatedAppointment.patientId.email,
          subject: 'Appointment Confirmation - AarogyaCare',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">AarogyaCare</h1>
                <p style="color: #e0f2fe; margin: 5px 0 0 0;">Quality Healthcare Services</p>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                <h2 style="color: #14b8a6; margin-top: 0;">✅ Appointment Confirmed!</h2>
                
                <p style="color: #374151; font-size: 16px;">Dear <strong>${name}</strong>,</p>
                
                <p style="color: #374151;">Your appointment has been successfully booked. Please find the details below:</p>
                
                <div style="background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 20px; margin: 20px 0; border-radius: 5px;">
                  <h3 style="color: #14b8a6; margin-top: 0;">Appointment Details</h3>
                  <p style="margin: 8px 0; color: #374151;"><strong>Doctor:</strong> ${doctor.name}</p>
                  <p style="margin: 8px 0; color: #374151;"><strong>Specialization:</strong> ${doctor.doctorDetails?.specialization || 'General Physician'}</p>
                  <p style="margin: 8px 0; color: #374151;"><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  <p style="margin: 8px 0; color: #374151;"><strong>Time:</strong> ${time}</p>
                  <p style="margin: 8px 0; color: #374151;"><strong>Consultation Fee:</strong> ₹${appointment.fees}</p>
                  ${reason ? `<p style="margin: 8px 0; color: #374151;"><strong>Reason:</strong> ${reason}</p>` : ''}
                </div>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0; color: #92400e;"><strong>⏳ Status:</strong> Pending Approval</p>
                  <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">Your appointment is pending approval from the doctor. You will receive a notification once it's approved.</p>
                </div>
                
                <p style="color: #374151;">A detailed receipt is attached to this email for your records.</p>
                
                <div style="margin: 30px 0; text-align: center;">
                  <a href="http://localhost:3000/my-appointments" style="background: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">View My Appointments</a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">If you have any questions, please contact us at <a href="mailto:aarogyacare55@gmail.com" style="color: #14b8a6;">aarogyacare55@gmail.com</a> or call +91 999 888 7777</p>
              </div>
              
              <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">Thank you for choosing AarogyaCare!</p>
                <p style="color: #9ca3af; font-size: 11px; margin: 5px 0 0 0;">This is an automated email. Please do not reply.</p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: `Appointment_Receipt_${name.replace(/\s+/g, '_')}.pdf`,
              path: receiptPath
            }
          ]
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Confirmation email with receipt sent to patient');

        // Delete the PDF file after sending
        setTimeout(() => {
          try {
            fs.unlinkSync(receiptPath);
            console.log('✅ Receipt PDF deleted after sending');
          } catch (err) {
            console.error('Error deleting receipt PDF:', err);
          }
        }, 5000);

      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
        // Don't fail the appointment creation if email fails
      }
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
          message: `You can now chat with  ${appointment.doctorId.name} about your appointment`
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

// Get detailed patient information for doctor
exports.getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user._id;
    
    // Get patient basic info
    const patient = await User.findById(patientId).select('-password');
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ msg: 'Patient not found' });
    }
    
    // Get all appointments between this doctor and patient
    const appointments = await Appointment.find({
      doctorId,
      patientId
    }).sort({ createdAt: -1 });
    
    // Get prescriptions for this patient from this doctor
    const Prescription = require('../models/Prescription');
    const prescriptions = await Prescription.find({
      doctorId,
      patientId
    }).sort({ createdAt: -1 });
    
    res.json({
      patient,
      appointments,
      prescriptions
    });
  } catch (err) {
    console.error('Error in getPatientDetails:', err);
    res.status(500).json({ msg: 'Error fetching patient details', error: err.message });
  }
};

// ✅ Get comprehensive patient data for doctor's patients
exports.getDoctorPatients = async (req, res) => {
  try {
    console.log('🔍 getDoctorPatients called for user:', req.user._id);
    
    const doctorId = req.user._id;
    
    // Get all appointments for this doctor with full patient data
    const appointments = await Appointment.find({
      doctorId,
      patientId: { $ne: null }
    })
    .populate({
      path: 'patientId',
      select: 'name email profileImage profile createdAt',
      match: { role: 'patient' }
    })
    .sort({ createdAt: -1 });

    console.log('🔍 Found appointments:', appointments.length);

    // Filter out appointments where patient population failed
    const validAppointments = appointments.filter(appointment => appointment.patientId);
    console.log('🔍 Valid appointments:', validAppointments.length);

    // Group appointments by patient
    const patientMap = new Map();
    
    validAppointments.forEach(appointment => {
      const patientId = appointment.patientId._id.toString();
      const patient = appointment.patientId;
      
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          profileImage: patient.profileImage,
          profile: patient.profile || {},
          joinedDate: patient.createdAt,
          appointments: [],
          totalAppointments: 0,
          completedAppointments: 0,
          pendingAppointments: 0,
          approvedAppointments: 0,
          cancelledAppointments: 0,
          lastAppointmentDate: null,
          nextAppointmentDate: null,
          totalFeesPaid: 0
        });
      }
      
      const patientData = patientMap.get(patientId);
      
      // Add appointment to patient's list
      patientData.appointments.push({
        _id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        reason: appointment.reason,
        fees: appointment.fees || 0,
        createdAt: appointment.createdAt
      });
      
      // Update statistics
      patientData.totalAppointments++;
      
      switch (appointment.status) {
        case 'completed':
        case 'visited':
          patientData.completedAppointments++;
          patientData.totalFeesPaid += appointment.fees || 0;
          break;
        case 'pending':
          patientData.pendingAppointments++;
          break;
        case 'approved':
          patientData.approvedAppointments++;
          break;
        case 'cancelled':
        case 'cancelled-by-patient':
        case 'rejected':
          patientData.cancelledAppointments++;
          break;
      }
      
      // Update dates
      if (!patientData.lastAppointmentDate || appointment.date > patientData.lastAppointmentDate) {
        patientData.lastAppointmentDate = appointment.date;
      }
      
      if (appointment.status === 'approved' && appointment.date > new Date()) {
        if (!patientData.nextAppointmentDate || appointment.date < patientData.nextAppointmentDate) {
          patientData.nextAppointmentDate = appointment.date;
        }
      }
    });

    // Convert to array and sort
    const patientsData = Array.from(patientMap.values())
      .sort((a, b) => {
        if (!a.lastAppointmentDate && !b.lastAppointmentDate) return 0;
        if (!a.lastAppointmentDate) return 1;
        if (!b.lastAppointmentDate) return -1;
        return new Date(b.lastAppointmentDate) - new Date(a.lastAppointmentDate);
      });

    console.log('✅ Returning patient data:', patientsData.length, 'patients');
    res.json(patientsData);
  } catch (err) {
    console.error('❌ Error in getDoctorPatients:', err);
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

    // Validate that the date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({ msg: 'Cannot book appointments for past dates' });
    }

    // Get doctor details
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    // Get day of week from date
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Find doctor's availability for this day
    const availability = doctor.doctorDetails?.availability?.find(
      slot => slot.day === dayOfWeek
    );

    if (!availability) {
      return res.json({ availableSlots: [], message: 'Doctor not available on this day' });
    }

    // Get already booked slots for this date (including pending, approved, and completed)
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
      // Exclude only cancelled/rejected appointments - all other statuses block the slot
      status: { $nin: ['cancelled', 'cancelled-by-patient', 'rejected'] }
    });

    const bookedSlots = bookedAppointments.map(apt => apt.time);

    // Generate available slots
    const availableSlots = [];
    const bookedSlotsResult = []; // to show as disabled in UI
    const [startHour, startMinute] = availability.startTime.split(':').map(Number);
    const [endHour, endMinute] = availability.endTime.split(':').map(Number);

    // For today, get current time to filter out past slots
    // NOTE: past-slot filtering is done client-side to avoid UTC/IST timezone issues

    // Generate 30-minute intervals
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === endHour && minute >= endMinute) break;

        const slotHour = hour < 10 ? `0${hour}` : `${hour}`;
        const slotMinute = minute < 10 ? `0${minute}` : `${minute}`;
        const slotTime = `${slotHour}:${slotMinute}`;

        if (bookedSlots.includes(slotTime)) {
          bookedSlotsResult.push(slotTime);
        } else {
          availableSlots.push(slotTime);
        }
      }
    }

    res.json({ 
      availableSlots,
      bookedSlots: bookedSlotsResult,
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
