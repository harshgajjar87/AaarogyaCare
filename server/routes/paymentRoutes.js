const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Chat = require('../models/Chat');
const Transaction = require('../models/Transaction');
const RevenueSettings = require('../models/RevenueSettings');
const transporter = require('../config/mail');
const { protect } = require('../middleware/authMiddleware');
const { generatePaymentReceiptPDF } = require('../utils/pdfGenerator');
const { calculateRevenueBreakdown } = require('../utils/revenueCalculator');

// HTML sanitization function
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Initialize Razorpay lazily
let razorpay = null;

const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpay;
};

// Get payment preview (fee breakdown before booking)
router.get('/preview', protect, async (req, res) => {
  try {
    const fees = parseFloat(req.query.fees);
    if (!fees || fees <= 0) return res.status(400).json({ success: false, message: 'Invalid fees' });

    let revenueSettings = await RevenueSettings.findOne({ isActive: true });
    if (!revenueSettings) {
      revenueSettings = { platformCommissionPercentage: 10, gstPercentage: 18, gstAppliedOn: 'commission', paymentGatewayPercentage: 2, paymentGatewayFixedCharge: 0 };
    }

    const breakdown = calculateRevenueBreakdown(fees, revenueSettings);
    res.json({ success: true, breakdown });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to calculate preview' });
  }
});

// Create Razorpay Order
router.post('/order', protect, async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount provided'
      });
    }

    const razorpayInstance = getRazorpayInstance();

    // Convert to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = amount * 100;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({ 
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create payment order'
    });
  }
});

// Verify Payment and Create Appointment
router.post('/verify-and-book', protect, async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log("Received payment verification request");
    }
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      bookingDetails
    } = req.body;
    
    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !bookingDetails) {
      console.error("Missing required fields in payment verification");
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information'
      });
    }



    // Verify signature
    console.log("Verifying payment signature");
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    if (process.env.NODE_ENV !== 'production') {
      console.log("Verifying payment signature");
    }

    if (generated_signature !== razorpay_signature) {
      console.error("Signature verification failed");
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
    
    console.log("Signature verification successful");

    // Get revenue settings
    let revenueSettings = await RevenueSettings.findOne({ isActive: true });
    if (!revenueSettings) {
      // Create default settings if none exist
      revenueSettings = await RevenueSettings.create({
        platformCommissionPercentage: 10,
        platformServiceFee: 20,
        gstPercentage: 0,
        gstAppliedOn: 'none',
        paymentGatewayPercentage: 2,
        paymentGatewayFixedCharge: 0,
        isActive: true
      });
      console.log('Created default revenue settings');
    }

    // Calculate revenue breakdown
    const revenueBreakdown = calculateRevenueBreakdown(bookingDetails.fees, revenueSettings);
    console.log('Revenue breakdown calculated:', revenueBreakdown);

    // Validate that the date is not in the past
    const appointmentDate = new Date(bookingDetails.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments for past dates'
      });
    }

    // Check if the time slot is already booked
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
      doctorId: bookingDetails.doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      time: bookingDetails.time,
      status: { $nin: ['cancelled', 'cancelled-by-patient', 'rejected'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please select another time.'
      });
    }

    // Create appointment after successful payment verification
    const appointment = new Appointment({
      patientId: bookingDetails.patientId,
      doctorId: bookingDetails.doctorId,
      name: bookingDetails.name,
      age: bookingDetails.age,
      gender: bookingDetails.gender,
      date: bookingDetails.date,
      time: bookingDetails.time,
      reason: bookingDetails.reason,
      fees: bookingDetails.fees,
      status: 'approved', // Set status to approved since payment is successful
      paymentInfo: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
        amount: revenueBreakdown.totalAmount, // Store actual amount paid
        status: 'completed'
      },
      revenueBreakdown: revenueBreakdown, // Store complete revenue breakdown
      // Enable chat for the approved appointment
      chatEnabled: true,
      chatCreatedAt: new Date()
    });

    // Set chat expiration to 5 days from now
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 5);
    appointment.chatExpiresAt = expirationDate;

    await appointment.save();

    // Create transaction record for financial tracking
    const transaction = new Transaction({
      appointmentId: appointment._id,
      patientId: bookingDetails.patientId,
      doctorId: bookingDetails.doctorId,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
      totalAmount: revenueBreakdown.totalAmount,
      doctorFees: revenueBreakdown.doctorFees,
      platformServiceFee: revenueBreakdown.platformServiceFee,
      platformCommission: revenueBreakdown.platformCommission,
      platformCommissionPercentage: revenueBreakdown.platformCommissionPercentage,
      gstAmount: 0,
      gstPercentage: 0,
      paymentGatewayCharges: revenueBreakdown.paymentGatewayCharges,
      doctorPayout: revenueBreakdown.doctorPayout,
      platformRevenue: revenueBreakdown.platformRevenue,
      status: 'completed',
      doctorPayoutStatus: 'pending'
    });

    await transaction.save();
    console.log('✅ Transaction record created:', transaction._id);

    // Get doctor details for notification
    const doctor = await User.findById(bookingDetails.doctorId);
    const patient = await User.findById(bookingDetails.patientId);

    // Create a chat for the approved appointment
    try {
      const existingChat = await Chat.findOne({ appointmentId: appointment._id });

      if (!existingChat) {
        const chat = new Chat({
          appointmentId: appointment._id,
          patientId: bookingDetails.patientId,
          doctorId: bookingDetails.doctorId,
          isActive: true
        });
        await chat.save();

        // Create notifications for both patient and doctor
        await Notification.create({
          userId: bookingDetails.patientId,
          message: `You can now chat wit ${doctor.name} about your appointment`
        });

        await Notification.create({
          userId: bookingDetails.doctorId,
          message: `You can now chat with ${bookingDetails.name} about your appointment`
        });

        console.log(`✅ Chat created successfully for appointment: ${appointment._id}`);
      } else {
        console.log(`ℹ️ Chat already exists for appointment: ${appointment._id}`);
      }
    } catch (chatErr) {
      console.error('❌ Error creating chat for approved appointment:', chatErr);
      // Don't fail the entire process if chat creation fails
    }

    // Create notification for the selected doctor
    await Notification.create({
      userId: bookingDetails.doctorId,
      message: `New appointment (approved) by ${bookingDetails.name} on ${bookingDetails.date} at ${bookingDetails.time}`
    });

    // Generate payment receipt PDF
    let receiptFileName = null;
    try {
      receiptFileName = await generatePaymentReceiptPDF(appointment, patient, doctor);
      console.log('✅ Payment receipt PDF generated:', receiptFileName);
    } catch (pdfErr) {
      console.error('❌ Error generating payment receipt PDF:', pdfErr);
    }

    // Send email notification to patient with receipt PDF
    if (process.env.MAIL_USER && patient.email) {
      try {
        const receiptDownloadUrl = receiptFileName 
          ? `${process.env.SERVER_URL || 'http://localhost:5000'}/uploads/${receiptFileName}`
          : null;

        const mailOptions = {
          from: process.env.MAIL_USER,
          to: patient.email,
          subject: 'Appointment Booking Confirmation - AarogyaCare',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #14b8a6; }
                .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
                .info-label { font-weight: bold; color: #14b8a6; }
                .info-value { color: #4b5563; }
                .payment-box { background: #ecfdf5; padding: 20px; margin: 15px 0; border-radius: 8px; border: 2px solid #14b8a6; }
                .amount { font-size: 24px; font-weight: bold; color: #14b8a6; text-align: center; margin: 10px 0; }
                .footer { text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px; }
                .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
                .button-secondary { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
                .note { background: #eff6ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 15px 0; }
                .receipt-box { background: #fef3c7; padding: 20px; margin: 15px 0; border-radius: 8px; border: 2px solid #f59e0b; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">🏥 AarogyaCare</h1>
                  <p style="margin: 10px 0 0 0;">Appointment Confirmed!</p>
                </div>
                
                <div class="content">
                  <p>Dear <strong>${escapeHtml(patient.name)}</strong>,</p>
                  
                  <p>Thank you for booking your appointment with AarogyaCare. Your payment has been successfully processed and your appointment is confirmed.</p>
                  
                  <div class="payment-box">
                    <h3 style="margin-top: 0; color: #14b8a6; text-align: center;">✓ Payment Successful</h3>
                    <div class="amount">₹ ${revenueBreakdown.totalAmount.toFixed(2)}</div>
                    <p style="text-align: center; margin: 5px 0; color: #6b7280;">Payment ID: ${escapeHtml(razorpay_payment_id)}</p>
                    <div style="margin-top:12px; font-size:12px; color:#4b5563; border-top:1px solid #d1fae5; padding-top:10px;">
                      <div style="display:flex; justify-content:space-between; margin:4px 0;"><span>Doctor fee</span><span>₹${revenueBreakdown.doctorFees.toFixed(2)}</span></div>
                      <div style="display:flex; justify-content:space-between; margin:4px 0;"><span>Platform service fee</span><span>₹${revenueBreakdown.platformServiceFee.toFixed(2)}</span></div>
                      <div style="display:flex; justify-content:space-between; margin:6px 0 0; font-weight:bold; border-top:1px solid #d1fae5; padding-top:6px;"><span>Total paid</span><span>₹${revenueBreakdown.totalAmount.toFixed(2)}</span></div>
                    </div>
                  </div>
                  
                  ${receiptDownloadUrl ? `
                  <div class="receipt-box">
                    <h3 style="margin-top: 0; color: #f59e0b;">📄 Payment Receipt</h3>
                    <p style="margin: 10px 0; color: #92400e;">Your payment receipt is attached to this email and can also be downloaded using the link below:</p>
                    <a href="${receiptDownloadUrl}" class="button-secondary" style="display: inline-block; margin-top: 10px;">📥 Download Receipt</a>
                    <p style="margin: 10px 0; font-size: 12px; color: #78716c;">Please save this receipt for your records</p>
                  </div>
                  ` : ''}
                  
                  <div class="info-box">
                    <h3 style="margin-top: 0; color: #14b8a6;">📋 Appointment Details</h3>
                    <div class="info-row">
                      <span class="info-label">Doctor:</span>
                      <span class="info-value">Dr. ${escapeHtml(doctor.name)}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Specialization:</span>
                      <span class="info-value">${escapeHtml(doctor.doctorDetails?.specialization || 'General Physician')}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Date:</span>
                      <span class="info-value">${escapeHtml(bookingDetails.date)}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Time:</span>
                      <span class="info-value">${escapeHtml(bookingDetails.time)}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Reason:</span>
                      <span class="info-value">${escapeHtml(bookingDetails.reason)}</span>
                    </div>
                  </div>
                  
                  <div class="note">
                    <strong>📌 Important Notes:</strong>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                      <li>Please arrive 10 minutes before your scheduled appointment time</li>
                      <li>Bring a valid ID and your payment receipt (attached/downloaded)</li>
                      <li>You can now chat with Dr. ${escapeHtml(doctor.name)} through your patient dashboard</li>
                      <li>Your chat access will remain active for 5 days</li>
                    </ul>
                  </div>
                  
                  <p style="text-align: center;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/patient-dashboard" class="button">View Dashboard</a>
                  </p>
                  
                  <p>If you have any questions or need to reschedule, please contact us at <a href="mailto:aarogyacare55@gmail.com">aarogyacare55@gmail.com</a> or call +91 999 888 7777.</p>
                  
                  <p>We look forward to serving you!</p>
                  
                  <p style="margin-top: 20px;">
                    Best regards,<br>
                    <strong>Team AarogyaCare</strong>
                  </p>
                </div>
                
                <div class="footer">
                  <p>This is an automated email. Please do not reply to this message.</p>
                  <p>© ${new Date().getFullYear()} AarogyaCare. All rights reserved.</p>
                  <p>Ahmedabad, Gujarat | Phone: +91 999 888 7777</p>
                </div>
              </div>
            </body>
            </html>
          `
        };

        // Attach PDF receipt if generated successfully
        if (receiptFileName) {
          const receiptPath = path.join(__dirname, '../uploads', receiptFileName);
          mailOptions.attachments = [{
            filename: `Payment_Receipt_${appointment._id}.pdf`,
            path: receiptPath
          }];
        }

        await transporter.sendMail(mailOptions);
        console.log('✅ Confirmation email sent to patient:', patient.email);
      } catch (emailErr) {
        console.error('❌ Failed to send email to patient:', emailErr);
      }
    }

    // Send email notification to doctor (if email is configured)
    if (process.env.MAIL_USER && doctor.email) {
      try {
        const mailOptions = {
          from: process.env.MAIL_USER,
          to: doctor.email,
          subject: 'New Approved Appointment - AarogyaCare',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #14b8a6; }
                .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
                .info-label { font-weight: bold; color: #14b8a6; }
                .info-value { color: #4b5563; }
                .footer { text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">🏥 AarogyaCare</h1>
                  <p style="margin: 10px 0 0 0;">New Appointment Notification</p>
                </div>
                
                <div class="content">
                  <p>Dear <strong>Dr. ${escapeHtml(doctor.name)}</strong>,</p>
                  
                  <p>You have received a new approved appointment. The patient has completed the payment successfully.</p>
                  
                  <div class="info-box">
                    <h3 style="margin-top: 0; color: #14b8a6;">👤 Patient Information</h3>
                    <div class="info-row">
                      <span class="info-label">Name:</span>
                      <span class="info-value">${escapeHtml(bookingDetails.name)}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Age:</span>
                      <span class="info-value">${escapeHtml(bookingDetails.age.toString())}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Gender:</span>
                      <span class="info-value">${escapeHtml(bookingDetails.gender)}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Date:</span>
                      <span class="info-value">${escapeHtml(bookingDetails.date)}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Time:</span>
                      <span class="info-value">${escapeHtml(bookingDetails.time)}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Reason:</span>
                      <span class="info-value">${escapeHtml(bookingDetails.reason)}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Payment ID:</span>
                      <span class="info-value">${escapeHtml(razorpay_payment_id)}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Amount Paid:</span>
                      <span class="info-value">₹ ${revenueBreakdown.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <p>The appointment has been automatically approved as the payment was successful. You can now chat with the patient through your doctor dashboard.</p>
                  
                  <p>Please log in to your dashboard to view more details and manage this appointment.</p>
                  
                  <p style="margin-top: 20px;">
                    Best regards,<br>
                    <strong>Team AarogyaCare</strong>
                  </p>
                </div>
                
                <div class="footer">
                  <p>This is an automated email. Please do not reply to this message.</p>
                  <p>© ${new Date().getFullYear()} AarogyaCare. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `
        };
        await transporter.sendMail(mailOptions);
        console.log('✅ Notification email sent to doctor:', doctor.email);
      } catch (emailErr) {
        console.error('❌ Failed to send email to doctor:', emailErr);
      }
    }

    res.json({
      success: true,
      message: 'Payment verified and appointment automatically approved successfully',
      appointment
    });
  } catch (error) {
    console.error('Error verifying payment and booking appointment:', error);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    
    // Log additional details if available
    if (error.errors) {
      console.error("Validation errors:", error.errors);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment and book appointment',
      error: error.message
    });
  }
});

module.exports = router;
