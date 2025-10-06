const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Get total number of patients
exports.getTotalPatients = async (req, res) => {
  try {
    const count = await User.countDocuments({ role: 'patient' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching patient count', error: err.message });
  }
};

// Get total number of doctors
exports.getTotalDoctors = async (req, res) => {
  try {
    const count = await User.countDocuments({ role: 'doctor' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching doctor count', error: err.message });
  }
};

// Get total number of appointments
exports.getTotalAppointments = async (req, res) => {
  try {
    const count = await Appointment.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching appointment count', error: err.message });
  }
};

// Get doctors grouped by specialization
exports.getDoctorsBySpecialization = async (req, res) => {
  try {
    const result = await User.aggregate([
      { $match: { role: 'doctor', 'doctorDetails.specialization': { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$doctorDetails.specialization',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object with specialization as key
    const doctorsBySpecialization = {};
    result.forEach(item => {
      doctorsBySpecialization[item._id] = item.count;
    });

    res.json(doctorsBySpecialization);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching doctors by specialization', error: err.message });
  }
};

// Get appointments count grouped by doctor
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const result = await Appointment.aggregate([
      { $match: { status: { $in: ['pending', 'approved'] } } },
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $group: {
          _id: '$doctor.name',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object with doctor name as key
    const appointmentsByDoctor = {};
    result.forEach(item => {
      appointmentsByDoctor[item._id] = item.count;
    });

    res.json(appointmentsByDoctor);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching appointments by doctor', error: err.message });
  }
};

// Get all patients with basic info
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' })
      .select('name email createdAt profileImage profile.phone isActive')
      .sort({ createdAt: -1 });

    console.log('Raw patients data from database:', JSON.stringify(patients[0], null, 2));

    // Process patients to ensure all fields are included
    const processedPatients = patients.map(patient => {
      // Use _id generation timestamp as fallback for createdAt if it's missing
      const createdAt = patient.createdAt || (patient._id ? new Date(parseInt(patient._id.toString().substring(0, 8), 16) * 1000) : new Date());
      
      const processedPatient = {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        profileImage: patient.profileImage || '',
        isActive: patient.isActive !== undefined ? patient.isActive : true,
        createdAt: createdAt,
        profile: {
          phone: patient.profile?.phone || 'N/A'
        }
      };
      
      console.log(`Patient ${patient._id} createdAt:`, processedPatient.createdAt);
      return processedPatient;
    });

    res.json(processedPatients);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching patients', error: err.message });
  }
};

// Get all doctors with basic info
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('name email createdAt profileImage doctorDetails.specialization')
      .sort({ createdAt: -1 });

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching doctors', error: err.message });
  }
};

// Get all appointments with details
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email doctorDetails.specialization')
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching appointments', error: err.message });
  }
};

// Toggle patient active/inactive status
exports.togglePatientActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await User.findById(id);

    if (!patient) {
      return res.status(404).json({ msg: 'Patient not found' });
    }

    if (patient.role !== 'patient') {
      return res.status(400).json({ msg: 'User is not a patient' });
    }

    patient.isActive = !patient.isActive;
    await patient.save();

    res.json({ 
      msg: `Patient ${patient.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: patient.isActive 
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error toggling patient status', error: err.message });
  }
};

// Get all contact queries
const Query = require('../models/Query');
const transporter = require('../config/mail');

exports.getQueries = async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching queries', error: err.message });
  }
};

// Admin reply to query
exports.replyToQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;
    const adminId = req.user.id; // Get admin ID from authenticated user

    // Validate required fields
    if (!replyMessage || replyMessage.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Reply message is required' 
      });
    }

    // Find the query
    const query = await Query.findById(id);
    if (!query) {
      return res.status(404).json({ 
        success: false, 
        message: 'Query not found' 
      });
    }

    // Update query with admin reply
    query.adminReply = replyMessage.trim();
    query.repliedAt = new Date();
    query.repliedBy = adminId;
    query.status = 'replied';

    await query.save();

    // Send email to the original query sender
    try {
      const mailOptions = {
        from: 'AarogyaCare55@gmail.com',
        to: query.email,
        subject: `Re: ${query.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5aa0;">Response to Your Query</h2>
            <p><strong>Original Query:</strong> ${query.subject}</p>
            <p><strong>From:</strong> ${query.name}</p>
            <p><strong>Admin Response:</strong></p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #2c5aa0;">
              ${replyMessage.replace(/\n/g, '<br>')}
            </div>
            <p><strong>Responded on:</strong> ${new Date().toLocaleString()}</p>
            <p>Thank you for contacting AarogyaCare. If you have any further questions, please don't hesitate to reach out.</p>
            <hr>
            <p style="color: #6c757d; font-size: 14px;">
              This is an automated response. Please do not reply to this email.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Failed to send reply email:', emailError);
      // Continue even if email fails - the reply is still saved in database
    }

    res.json({
      success: true,
      message: 'Reply sent successfully',
      query: query
    });

  } catch (err) {
    console.error('Error replying to query:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error replying to query', 
      error: err.message 
    });
  }
};
