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
app.use('/api/verification', require('./routes/doctorVerificationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/upload', require('./routes/imageRoutes'));

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
