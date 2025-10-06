const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Chat = require('../models/Chat');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Import the chat controller functions directly
const chatController = require('../controllers/chatController');

let mongoServer;

describe('Chat Controller', () => {
  let user, appointment, chat;

beforeAll(async () => {
  jest.setTimeout(10000); // Set timeout to 10 seconds
  // Setup in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create a test user and appointment
  user = new User({ name: 'Test User', email: 'test@example.com', password: 'password' });
  await user.save();

  appointment = new Appointment({ 
    patientId: user._id, 
    doctorId: user._id, 
    name: 'Test Patient',
    age: 30,
    gender: 'Male',
    status: 'approved',
    date: new Date(),
    time: '10:00 AM',
    reason: 'Test appointment'
  });
  await appointment.save();
});

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Chat.deleteMany({});
  });

  test('should create a new chat for an approved appointment', async () => {
    const req = {
      body: { appointmentId: appointment._id },
      user: { _id: user._id, role: 'patient' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await chatController.createOrAccessChat(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    
    // Check that a chat was created
    const chats = await Chat.find({});
    expect(chats).toHaveLength(1);
    expect(chats[0].isActive).toBe(true);
  });

  test('should end a chat by doctor', async () => {
    // First create a chat
    chat = new Chat({
      appointmentId: appointment._id,
      patientId: user._id,
      doctorId: user._id,
      isActive: true,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    });
    await chat.save();

    const req = {
      params: { chatId: chat._id },
      user: { _id: user._id, role: 'doctor' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await chatController.endChat(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'Chat ended successfully',
      chat: expect.any(Object)
    });

    // Verify the chat was ended
    const updatedChat = await Chat.findById(chat._id);
    expect(updatedChat.isActive).toBe(false);
    expect(updatedChat.endedByDoctor).toBe(true);
  });

  test('should not allow sending messages in an ended chat', async () => {
    // Create an ended chat
    chat = new Chat({
      appointmentId: appointment._id,
      patientId: user._id,
      doctorId: user._id,
      isActive: false,
      endedByDoctor: true,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });
    await chat.save();

    const req = {
      params: { chatId: chat._id },
      body: { message: 'Hello' },
      user: { _id: user._id, role: 'patient' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await chatController.sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'Chat session has expired or has been ended by the doctor'
    });
  });
});
