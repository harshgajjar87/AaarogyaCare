const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Review = require('../models/Review');

// Doctor Analytics
exports.getDoctorAnalytics = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointments = await Appointment.find({ doctorId }).populate('patientId', 'name');

    // Total appointments by status
    const statusCounts = appointments.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    // Monthly appointments (last 6 months)
    const monthlyData = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[key] = 0;
    }
    appointments.forEach(app => {
      const date = new Date(app.date);
      const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthlyData.hasOwnProperty(key)) monthlyData[key]++;
    });

    // Revenue calculation — based on doctorPayout (listed fee minus commission)
    const paidAppointments = appointments.filter(a => a.paymentInfo?.status === 'completed');

    // totalRevenue = what doctor actually receives (after commission deduction)
    const totalRevenue = paidAppointments
      .reduce((sum, a) => sum + (a.revenueBreakdown?.doctorPayout || a.fees || 0), 0);

    // totalGrossRevenue = sum of listed fees (before commission deduction)
    const totalGrossRevenue = paidAppointments
      .reduce((sum, a) => sum + (a.revenueBreakdown?.doctorFees || a.fees || 0), 0);

    // totalCommissionDeducted = commission taken from doctor payout
    const totalCommissionDeducted = paidAppointments
      .reduce((sum, a) => sum + (a.revenueBreakdown?.platformCommission || 0), 0);

    // platformServiceFeeCollected = flat service fees paid by patients
    const platformServiceFeeCollected = paidAppointments
      .reduce((sum, a) => sum + (a.revenueBreakdown?.platformServiceFee || 0), 0);

    const commissionRate = paidAppointments.length > 0
      ? (paidAppointments[0].revenueBreakdown?.platformCommissionPercentage || 10)
      : 10;

    const monthlyRevenue = {};
    Object.keys(monthlyData).forEach(key => monthlyRevenue[key] = 0);
    appointments
      .filter(a => a.paymentInfo?.status === 'completed')
      .forEach(app => {
        const date = new Date(app.date);
        const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (monthlyRevenue.hasOwnProperty(key)) {
          monthlyRevenue[key] += app.revenueBreakdown?.doctorPayout || app.fees || 0;
        }
      });
    // Average consultation time (mock data - can be enhanced)
    const avgConsultationTime = 30; // minutes

    // Patient demographics
    const uniquePatients = [...new Set(appointments.map(a => a.patientId?._id?.toString()))].filter(Boolean);
    
    // Reviews
    const reviews = await Review.find({ doctorId });
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    // Peak hours
    const hourCounts = {};
    appointments.forEach(app => {
      const hour = parseInt(app.time.split(':')[0]);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    res.json({
      totalAppointments: appointments.length,
      statusCounts,
      monthlyAppointments: monthlyData,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalGrossRevenue: parseFloat(totalGrossRevenue.toFixed(2)),
      totalCommissionDeducted: parseFloat(totalCommissionDeducted.toFixed(2)),
      platformServiceFeeCollected: parseFloat(platformServiceFeeCollected.toFixed(2)),
      commissionRate,
      monthlyRevenue,
      avgConsultationTime,
      totalPatients: uniquePatients.length,
      avgRating,
      totalReviews: reviews.length,
      peakHours: hourCounts
    });
  } catch (error) {
    console.error('Doctor analytics error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Admin Analytics
exports.getAdminAnalytics = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('doctorId patientId', 'name');
    const doctors = await User.find({ role: 'doctor' });
    const patients = await User.find({ role: 'patient' });

    // Monthly appointments (last 6 months)
    const monthlyData = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[key] = 0;
    }
    appointments.forEach(app => {
      const date = new Date(app.date);
      const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthlyData.hasOwnProperty(key)) monthlyData[key]++;
    });

    // Revenue — full breakdown (new model)
    const paidApps = appointments.filter(a => a.paymentInfo?.status === 'completed');

    const totalRevenue = paidApps.reduce((sum, a) => sum + (a.paymentInfo?.amount || 0), 0);
    const totalDoctorPayouts = paidApps.reduce((sum, a) => sum + (a.revenueBreakdown?.doctorPayout || a.fees || 0), 0);
    const totalPlatformCommission = paidApps.reduce((sum, a) => sum + (a.revenueBreakdown?.platformCommission || 0), 0);
    const totalServiceFees = paidApps.reduce((sum, a) => sum + (a.revenueBreakdown?.platformServiceFee || 0), 0);
    const totalGatewayCharges = paidApps.reduce((sum, a) => sum + (a.revenueBreakdown?.paymentGatewayCharges || 0), 0);
    const totalPlatformRevenue = paidApps.reduce((sum, a) => sum + (a.revenueBreakdown?.platformRevenue || 0), 0);

    const monthlyRevenue = {};
    Object.keys(monthlyData).forEach(key => monthlyRevenue[key] = 0);
    paidApps.forEach(app => {
        const date = new Date(app.date);
        const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (monthlyRevenue.hasOwnProperty(key)) {
          monthlyRevenue[key] += app.paymentInfo?.amount || 0;
        }
      });

    // Doctors by specialization
    const specializationCounts = doctors.reduce((acc, doc) => {
      const spec = doc.doctorDetails?.specialization || 'General';
      acc[spec] = (acc[spec] || 0) + 1;
      return acc;
    }, {});

    // Top doctors by appointments
    const doctorAppointments = {};
    appointments.forEach(app => {
      const docName = app.doctorId?.name || 'Unknown';
      doctorAppointments[docName] = (doctorAppointments[docName] || 0) + 1;
    });
    const topDoctors = Object.entries(doctorAppointments)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

    // Status distribution
    const statusCounts = appointments.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    // User growth (last 6 months)
    const userGrowth = {};
    Object.keys(monthlyData).forEach(key => userGrowth[key] = { doctors: 0, patients: 0 });
    [...doctors, ...patients].forEach(user => {
      const date = new Date(user.createdAt);
      const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (userGrowth[key]) {
        userGrowth[key][user.role === 'doctor' ? 'doctors' : 'patients']++;
      }
    });

    res.json({
      totalAppointments: appointments.length,
      totalDoctors: doctors.length,
      totalPatients: patients.length,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalDoctorPayouts: parseFloat(totalDoctorPayouts.toFixed(2)),
      totalPlatformCommission: parseFloat(totalPlatformCommission.toFixed(2)),
      totalServiceFees: parseFloat(totalServiceFees.toFixed(2)),
      totalGatewayCharges: parseFloat(totalGatewayCharges.toFixed(2)),
      totalPlatformRevenue: parseFloat(totalPlatformRevenue.toFixed(2)),
      monthlyAppointments: monthlyData,
      monthlyRevenue,
      specializationCounts,
      topDoctors,
      statusCounts,
      userGrowth
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
