const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Verify JWT Token
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ msg: 'No token provided' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token invalid or expired' });
  }
};

// ✅ Allow only Users (basic authenticated users)
const isUser = (req, res, next) => {
  if (!['patient', 'pending_doctor', 'doctor'].includes(req.user.role))
    return res.status(403).json({ msg: 'Access denied: Users only' });
  next();
};

// ✅ Allow only Pending Doctors
const isPendingDoctor = (req, res, next) => {
  if (req.user.role !== 'pending_doctor')
    return res.status(403).json({ msg: 'Access denied: Pending doctors only' });
  next();
};

// ✅ Allow only Verified Doctors
const isDoctor = (req, res, next) => {
  if (req.user.role !== 'doctor')
    return res.status(403).json({ msg: 'Access denied: Verified doctors only' });
  next();
};

// ✅ Allow only Patients (legacy - now 'user' role)
const isPatient = (req, res, next) => {
  if (req.user.role !== 'patient')
    return res.status(403).json({ msg: 'Access denied: Patients only' });
  next();
};

// ✅ Allow only Admin
const admin = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ msg: 'Access denied: Admin only' });
  next();
};

module.exports = { protect, isDoctor, isPatient, admin };
