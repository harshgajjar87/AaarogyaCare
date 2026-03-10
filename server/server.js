const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve static files from the public directory as well
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AarogyaCare Server is running',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Configuration check endpoint
app.get('/api/config/check', (req, res) => {
  const config = {
    database: !!process.env.MONGO_URI,
    jwt: !!process.env.JWT_SECRET,
    mailjet: !!(process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY),
    razorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    openai: !!process.env.OPENAI_API_KEY,
    groq: !!process.env.GROQ_API_KEY
  };
  
  res.json({
    message: 'Configuration status',
    services: config,
    allConfigured: Object.values(config).every(Boolean)
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/dev', require('./routes/devRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/otp', require('./routes/otpRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/admin/appointments', require('./routes/adminAppointmentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/doctors/new', require('./routes/adminDoctorRoutesNew'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/ai', require('./routes/aiExtractionRoutes'));
app.use('/api/verification', require('./routes/doctorVerificationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/upload', require('./routes/imageRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/analysis', require('./routes/analysisRoutes'));
app.use('/api/triage', require('./routes/triageRoutes'));
app.use('/api/tts', require('./routes/ttsRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/health', require('./routes/healthPredictionRoutes'));
app.use('/api/test', require('./routes/testRoutes'));

// DB & Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
