
const Chat = require('../models/Chat');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ✅ Create or access a chat for an approved appointment
exports.createOrAccessChat = async (req, res) => {
  try {
    console.log('createOrAccessChat called with:', req.body, req.user);
    const { appointmentId } = req.body;
    const userId = req.user._id;

    // If no appointmentId is provided, find all approved appointments for the user
    if (!appointmentId) {
      console.log('No appointmentId provided, handling automatic chat access');
      return await this.handleAutomaticChatAccess(req, res);
    }

    // Verify appointment exists and is approved
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId doctorId');

    if (!appointment) {
      console.log('Appointment not found');
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    if (appointment.status !== 'approved') {
      console.log('Appointment is not approved');
      return res.status(400).json({ msg: 'Chat is only available for approved appointments' });
    }

    // Verify user is either the patient or the doctor of this appointment
    if (appointment.patientId._id.toString() !== userId.toString() && 
        appointment.doctorId._id.toString() !== userId.toString()) {
      console.log('User is not authorized to access this chat');
      return res.status(403).json({ msg: 'Not authorized to access this chat' });
    }

    // Check if chat already exists for this appointment
    let chat = await Chat.findOne({ appointmentId });

    // If chat doesn't exist, create a new one
    if (!chat) {
      console.log('Creating a new chat');
      // Determine who is the patient and who is the doctor
      const patientId = appointment.patientId._id;
      const doctorId = appointment.doctorId._id;

      // Set expiration date to 5 days from now
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 5);
      
      chat = new Chat({
        appointmentId,
        patientId,
        doctorId,
        isActive: true,
        expiresAt: expirationDate
      });

      await chat.save();

      // Create notifications for both patient and doctor
      await Notification.create({
        userId: patientId,
        message: `You can now chat with Dr. ${appointment.doctorId.name} about your appointment`
      });

      await Notification.create({
        userId: doctorId,
        message: `You can now chat with ${appointment.patientId.name} about your appointment`
      });
    }

// Check if chat is still active (not expired and not ended by doctor)
const now = new Date();
console.log('Checking chat status:', {
  expiresAt: chat.expiresAt,
  now: now,
  endedByDoctor: chat.endedByDoctor,
  isExpired: chat.expiresAt < now,
  shouldEnd: chat.expiresAt < now || chat.endedByDoctor
});

if (chat.expiresAt < now || chat.endedByDoctor) {
  chat.isActive = false;
  if (!chat.isArchived) {
    chat.isArchived = true;
    console.log('Marking chat as archived due to expiration or ended by doctor');
  }
  await chat.save();
  console.log('Chat session has expired or has been ended by the doctor - returning read-only access');

  // Return chat data with readOnly flag instead of error
  await chat.populate('messages.senderId', 'name');
  return res.status(200).json({
    ...chat.toObject(),
    status: 'archived',
    readOnly: true
  });
}

    // Populate messages with sender details
    await chat.populate('messages.senderId', 'name');
    console.log('Chat populated successfully, sending response');
    res.status(200).json(chat);
  } catch (err) {
    console.error('Error accessing chat:', err);
    res.status(500).json({ msg: 'Error accessing chat', error: err.message });
  }
};

// ✅ Handle automatic chat access without appointment ID
exports.handleAutomaticChatAccess = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Find all approved appointments for this user
    const query = userRole === 'patient' 
      ? { patientId: userId, status: 'approved' }
      : { doctorId: userId, status: 'approved' };

    const approvedAppointments = await Appointment.find(query)
      .populate(userRole === 'patient' ? 'doctorId' : 'patientId', 'name email profileImage')
      .sort({ date: -1 });

    if (approvedAppointments.length === 0) {
      return res.status(404).json({ 
        msg: 'No approved appointments found',
        hasApprovedAppointments: false
      });
    }

    // For each approved appointment, ensure a chat exists
    const chats = [];
    for (const appointment of approvedAppointments) {
      let chat = await Chat.findOne({ appointmentId: appointment._id });

      // If chat doesn't exist, create it
      if (!chat) {
        const patientId = userRole === 'patient' ? userId : appointment.patientId;
        const doctorId = userRole === 'doctor' ? userId : appointment.doctorId;

        // Set expiration date to 5 days from now
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 5);
        
        chat = new Chat({
          appointmentId: appointment._id,
          patientId,
          doctorId,
          isActive: true,
          expiresAt: expirationDate
        });

        await chat.save();

        // Create notifications for both participants
        await Notification.create({
          userId: patientId,
          message: `You can now chat with Dr. ${appointment.doctorId.name} about your appointment`
        });

        await Notification.create({
          userId: doctorId,
          message: `You can now chat with ${appointment.patientId.name} about your appointment`
        });
      }

      // Check if chat is still active
      const now = new Date();
      if (chat.expiresAt < now) {
        chat.isActive = false;
        await chat.save();
        continue; // Skip expired chats
      }

      // Populate chat details
      await chat.populate('appointmentId', 'date time status reason');
      await chat.populate('patientId', 'name profileImage');
      await chat.populate('doctorId', 'name profileImage');
      await chat.populate('messages.senderId', 'name profileImage');

      chats.push(chat);
    }

    if (chats.length === 0) {
      // If no active chats found, try to find archived chats
      const archivedChats = await Chat.find({
        $or: [
          { patientId: userId },
          { doctorId: userId }
        ],
        isArchived: true
      })
      .populate('appointmentId', 'date time status reason')
      .populate('patientId', 'name profileImage')
      .populate('doctorId', 'name profileImage')
      .populate('messages.senderId', 'name profileImage')
      .sort({ updatedAt: -1 });

      if (archivedChats.length === 0) {
        return res.status(404).json({ 
          msg: 'No active chats found for your approved appointments',
          hasApprovedAppointments: true,
          allChatsExpired: true
        });
      }

      // Return archived chats with a different status
      res.json({
        chats: archivedChats,
        status: 'archived'
      });
    } else {
      res.json({
        chats: chats,
        status: 'active'
      });
    }
  } catch (err) {
    res.status(500).json({ msg: 'Error accessing chats automatically', error: err.message });
  }
};

// ✅ Get all chats for a user (either patient or doctor) - includes both active and archived
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all chats for the user (both active and archived)
    const chats = await Chat.find({
      $or: [
        { patientId: userId },
        { doctorId: userId }
      ]
    })
    .populate('appointmentId', 'date time status reason')
    .populate('patientId', 'name profileImage')
    .populate('doctorId', 'name profileImage')
    .sort({ updatedAt: -1 });

    const now = new Date();
    const activeChats = [];
    const archivedChats = [];

    // Process each chat
    for (const chat of chats) {
      // Check if chat is expired but not yet archived
      if (chat.expiresAt <= now && !chat.isArchived) {
        chat.isActive = false;
        chat.isArchived = true;
        await chat.save();
        console.log(`Marked chat ${chat._id} as archived due to expiration`);
      }

      // Categorize chats
      if (chat.isArchived) {
        archivedChats.push(chat);
      } else if (chat.isActive && chat.expiresAt > now) {
        activeChats.push(chat);
      }
    }

    console.log(`User ${userId} chats: ${activeChats.length} active, ${archivedChats.length} archived`);

    res.json({
      active: activeChats,
      archived: archivedChats
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching chats', error: err.message });
  }
};

// ✅ Get specific chat by ID (allows access to archived chats)
exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId)
      .populate('appointmentId', 'date time status reason')
      .populate('patientId', 'name profileImage')
      .populate('doctorId', 'name profileImage')
      .populate('messages.senderId', 'name profileImage');

    if (!chat) {
      return res.status(404).json({ msg: 'Chat not found' });
    }

    // Check if user is part of this chat
    if (chat.patientId._id.toString() !== userId.toString() && 
        chat.doctorId._id.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'Not authorized to access this chat' });
    }

    // Check if chat is expired but not yet archived
    const now = new Date();
    if (chat.expiresAt < now && !chat.isArchived) {
      chat.isActive = false;
      chat.isArchived = true;
      await chat.save();
    }

    // Allow access to archived chats (read-only)
    if (chat.isArchived) {
      return res.json({
        ...chat.toObject(),
        status: 'archived',
        readOnly: true
      });
    }

    // Check if chat is still active (not expired and not ended by doctor)
    if (chat.expiresAt < now || chat.endedByDoctor) {
      chat.isActive = false;
      if (!chat.isArchived) {
        chat.isArchived = true;
        console.log('Marking chat as archived due to expiration or ended by doctor');
      }
      await chat.save();
      console.log('Chat session has expired or has been ended by the doctor - returning read-only access');

      // Return chat data with readOnly flag instead of error
      return res.status(200).json({
        ...chat.toObject(),
        status: 'archived',
        readOnly: true
      });
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching chat', error: err.message });
  }
};

// ✅ Send a message in a chat
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    // Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ msg: 'Chat not found' });
    }

    // Check if user is part of this chat
    if (chat.patientId.toString() !== userId.toString() && 
        chat.doctorId.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'Not authorized to send messages in this chat' });
    }

    // Check if chat is still active (not expired and not ended by doctor)
    const now = new Date();
    if (chat.expiresAt < now || chat.endedByDoctor) {
      chat.isActive = false;
      await chat.save();
      return res.status(400).json({ msg: 'Chat session has expired or has been ended by the doctor' });
    }

    // Add the message
    const newMessage = {
      senderId: userId,
      message
    };

    chat.messages.push(newMessage);
    chat.updatedAt = new Date();
    await chat.save();

    // Populate the sender details for the response
    await chat.populate('messages.senderId', 'name profileImage');

    // Create notification for the other participant
    const otherUserId = chat.patientId.toString() === userId.toString() 
      ? chat.doctorId 
      : chat.patientId;

    await Notification.create({
      userId: otherUserId,
      message: `New message from ${req.user.name}`
    });

    res.json(chat);
  } catch (err) {
    res.status(500).json({ msg: 'Error sending message', error: err.message });
  }
};

// ✅ End chat by doctor
exports.endChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ msg: 'Chat not found' });
    }

    // Check if user is the doctor of this chat
    if (chat.doctorId.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'Not authorized to end this chat' });
    }

    // End the chat
    chat.isActive = false;
    chat.endedByDoctor = true;
    await chat.save();

    res.status(200).json({ msg: 'Chat ended successfully', chat });
  } catch (err) {
    res.status(500).json({ msg: 'Error ending chat', error: err.message });
  }
};

// ✅ Extend chat expiration (for approved appointments)
exports.extendChatExpiration = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ msg: 'Chat not found' });
    }

    // Check if user is the doctor of this chat
    if (chat.doctorId.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'Only doctors can extend this chat' });
    }

    // Extend expiration by 5 days
    chat.expiresAt = new Date(chat.expiresAt.getTime() + (5 * 24 * 60 * 60 * 1000));
    chat.isActive = true;
    await chat.save();

    res.json({ msg: 'Chat expiration extended successfully', chat });
  } catch (err) {
    res.status(500).json({ msg: 'Error extending chat expiration', error: err.message });
  }
};

// ✅ Debug endpoint: Check if user has approved appointments
exports.checkApprovedAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Find approved appointments for this user
    const query = userRole === 'patient' 
      ? { patientId: userId, status: 'approved' }
      : { doctorId: userId, status: 'approved' };

    const approvedAppointments = await Appointment.find(query)
      .populate(userRole === 'patient' ? 'doctorId' : 'patientId', 'name email')
      .sort({ date: -1 });

    res.json({
      userId,
      userRole,
      hasApprovedAppointments: approvedAppointments.length > 0,
      approvedAppointmentsCount: approvedAppointments.length,
      approvedAppointments: approvedAppointments.map(apt => ({
        _id: apt._id,
        date: apt.date,
        time: apt.time,
        reason: apt.reason,
        otherParty: userRole === 'patient' ? apt.doctorId : apt.patientId
      }))
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error checking approved appointments', error: err.message });
  }
};

// ✅ Debug endpoint: Create test chat (development only)
exports.createTestChat = async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ msg: 'Test chat creation only allowed in development mode' });
    }

    const { appointmentId } = req.body;
    const userId = req.user._id;

    // Verify appointment exists and is approved
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId doctorId');

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    if (appointment.status !== 'approved') {
      return res.status(400).json({ msg: 'Appointment must be approved to create a chat' });
    }

    // Verify user is either the patient or the doctor of this appointment
    if (appointment.patientId._id.toString() !== userId.toString() && 
        appointment.doctorId._id.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'Not authorized to create chat for this appointment' });
    }

    // Check if chat already exists for this appointment
    let chat = await Chat.findOne({ appointmentId });

    // If chat doesn't exist, create a new one
    if (!chat) {
      // Set expiration date to 5 days from now
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 5);
      
      chat = new Chat({
        appointmentId,
        patientId: appointment.patientId._id,
        doctorId: appointment.doctorId._id,
        isActive: true,
        expiresAt: expirationDate
      });

      await chat.save();
    }

    // Populate messages with sender details
    await chat.populate('messages.senderId', 'name');

    res.json({
      msg: 'Test chat created/accessed successfully',
      chat,
      appointment: {
        _id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error creating test chat', error: err.message });
  }
};

// ✅ Health check endpoint
exports.healthCheck = async (req, res) => {
  try {
    // Simple health check - count active chats
    const activeChatsCount = await Chat.countDocuments({ isActive: true });
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      activeChats: activeChatsCount,
      message: 'Chat service is running normally'
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      error: err.message 
    });
  }
};
