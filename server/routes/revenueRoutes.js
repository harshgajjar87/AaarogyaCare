const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const RevenueSettings = require('../models/RevenueSettings');
const Transaction = require('../models/Transaction');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @route   GET /api/revenue/settings
// @desc    Get current revenue settings
// @access  Admin only
router.get('/settings', protect, admin, async (req, res) => {
  try {
    let settings = await RevenueSettings.findOne({ isActive: true });
    
    if (!settings) {
      // Create default settings
      settings = await RevenueSettings.create({
        platformCommissionPercentage: 10,
        platformServiceFee: 20,
        gstPercentage: 0,
        gstAppliedOn: 'none',
        paymentGatewayPercentage: 2,
        paymentGatewayFixedCharge: 0,
        isActive: true
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching revenue settings:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/revenue/settings
// @desc    Update revenue settings
// @access  Admin only
router.put('/settings', protect, admin, async (req, res) => {
  try {
    const {
      platformCommissionPercentage,
      platformServiceFee,
      paymentGatewayPercentage,
      paymentGatewayFixedCharge,
      minimumTransactionAmount,
      notes
    } = req.body;

    // Deactivate current settings
    await RevenueSettings.updateMany({ isActive: true }, { isActive: false });

    // Create new settings
    const newSettings = await RevenueSettings.create({
      platformCommissionPercentage,
      platformServiceFee: platformServiceFee ?? 20,
      gstPercentage: 0,
      gstAppliedOn: 'none',
      paymentGatewayPercentage,
      paymentGatewayFixedCharge,
      minimumTransactionAmount,
      notes,
      isActive: true,
      effectiveFrom: new Date()
    });

    res.json({
      success: true,
      settings: newSettings,
      message: 'Revenue settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating revenue settings:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/revenue/analytics
// @desc    Get revenue analytics
// @access  Admin only
router.get('/analytics', protect, admin, async (req, res) => {
  try {
    const { startDate, endDate, period = 'all' } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else if (period !== 'all') {
      const now = new Date();
      switch (period) {
        case 'today':
          dateFilter = {
            createdAt: {
              $gte: new Date(now.setHours(0, 0, 0, 0))
            }
          };
          break;
        case 'week':
          dateFilter = {
            createdAt: {
              $gte: new Date(now.setDate(now.getDate() - 7))
            }
          };
          break;
        case 'month':
          dateFilter = {
            createdAt: {
              $gte: new Date(now.setMonth(now.getMonth() - 1))
            }
          };
          break;
        case 'year':
          dateFilter = {
            createdAt: {
              $gte: new Date(now.setFullYear(now.getFullYear() - 1))
            }
          };
          break;
      }
    }

    // Get all completed transactions
    const transactions = await Transaction.find({
      ...dateFilter,
      status: 'completed'
    });

    // Calculate totals
    const analytics = {
      totalTransactions: transactions.length,
      totalRevenue: transactions.reduce((sum, t) => sum + t.totalAmount, 0),
      platformRevenue: transactions.reduce((sum, t) => sum + t.platformRevenue, 0),
      platformCommission: transactions.reduce((sum, t) => sum + t.platformCommission, 0),
      totalServiceFees: transactions.reduce((sum, t) => sum + (t.platformServiceFee || 0), 0),
      gatewayCharges: transactions.reduce((sum, t) => sum + t.paymentGatewayCharges, 0),
      doctorPayouts: transactions.reduce((sum, t) => sum + t.doctorPayout, 0),
      pendingPayouts: transactions.filter(t => t.doctorPayoutStatus === 'pending').length,
      completedPayouts: transactions.filter(t => t.doctorPayoutStatus === 'completed').length
    };

    // Get top earning doctors
    const doctorEarnings = {};
    transactions.forEach(t => {
      if (!doctorEarnings[t.doctorId]) {
        doctorEarnings[t.doctorId] = {
          doctorId: t.doctorId,
          totalEarnings: 0,
          totalAppointments: 0,
          pendingPayout: 0
        };
      }
      doctorEarnings[t.doctorId].totalEarnings += t.doctorPayout;
      doctorEarnings[t.doctorId].totalAppointments += 1;
      if (t.doctorPayoutStatus === 'pending') {
        doctorEarnings[t.doctorId].pendingPayout += t.doctorPayout;
      }
    });

    const topDoctors = Object.values(doctorEarnings)
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, 10);

    // Populate doctor details
    for (let doctor of topDoctors) {
      const doctorUser = await User.findById(doctor.doctorId).select('name email');
      doctor.name = doctorUser?.name || 'Unknown';
      doctor.email = doctorUser?.email || '';
    }

    res.json({
      analytics,
      topDoctors,
      period,
      dateRange: dateFilter.createdAt ? {
        start: dateFilter.createdAt.$gte,
        end: dateFilter.createdAt.$lte
      } : null
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/revenue/transactions
// @desc    Get all transactions with filters
// @access  Admin only
router.get('/transactions', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, payoutStatus, doctorId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (payoutStatus) filter.doctorPayoutStatus = payoutStatus;
    if (doctorId) filter.doctorId = doctorId;

    const transactions = await Transaction.find(filter)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .populate('appointmentId', 'date time reason')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/revenue/payout/:transactionId
// @desc    Mark doctor payout as completed
// @access  Admin only
router.put('/payout/:transactionId', protect, admin, async (req, res) => {
  try {
    const { payoutReference, notes } = req.body;

    const transaction = await Transaction.findById(req.params.transactionId);
    
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    transaction.doctorPayoutStatus = 'completed';
    transaction.doctorPayoutDate = new Date();
    transaction.doctorPayoutReference = payoutReference;
    if (notes) transaction.notes = notes;

    await transaction.save();

    res.json({
      success: true,
      transaction,
      message: 'Payout marked as completed'
    });
  } catch (error) {
    console.error('Error updating payout status:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/revenue/doctor-earnings
// @desc    Get doctor's earnings (for doctor dashboard)
// @access  Doctor only
router.get('/doctor-earnings', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const transactions = await Transaction.find({
      doctorId: req.user._id,
      status: 'completed'
    }).populate('appointmentId', 'date time reason patientId')
      .populate('patientId', 'name')
      .sort({ createdAt: -1 });

    const earnings = {
      totalEarnings: transactions.reduce((sum, t) => sum + t.doctorPayout, 0),
      pendingPayout: transactions
        .filter(t => t.doctorPayoutStatus === 'pending')
        .reduce((sum, t) => sum + t.doctorPayout, 0),
      completedPayout: transactions
        .filter(t => t.doctorPayoutStatus === 'completed')
        .reduce((sum, t) => sum + t.doctorPayout, 0),
      totalAppointments: transactions.length,
      transactions: transactions.slice(0, 10) // Last 10 transactions
    };

    res.json(earnings);
  } catch (error) {
    console.error('Error fetching doctor earnings:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
