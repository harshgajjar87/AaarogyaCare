const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const transporter = require('../config/mail');
const { protect } = require('../middleware/authMiddleware');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay Order
router.post('/order', protect, async (req, res) => {
  try {
    const { amount } = req.body;

    // Convert to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = amount * 100;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

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
    console.log("Received payment verification request with body:", req.body);
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
    
    console.log("Generated signature:", generated_signature);
    console.log("Received signature:", razorpay_signature);

    if (generated_signature !== razorpay_signature) {
      console.error("Signature verification failed");
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
    
    console.log("Signature verification successful");

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
        amount: bookingDetails.fees,
        status: 'completed'
      },
      // Enable chat for the approved appointment
      chatEnabled: true,
      chatCreatedAt: new Date()
    });

    // Set chat expiration to 5 days from now
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 5);
    appointment.chatExpiresAt = expirationDate;

    await appointment.save();

    // Get doctor details for notification
    const doctor = await User.findById(bookingDetails.doctorId);

    // Create a chat for the approved appointment
    const Chat = require('../models/Chat');
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
          message: `You can now chat with Dr. ${doctor.name} about your appointment`
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

    // Send email notification to doctor (if email is configured)
    if (process.env.MAIL_USER && process.env.MAIL_PASS && doctor.email) {
      try {
        const mailOptions = {
          from: process.env.MAIL_USER,
          to: doctor.email,
          subject: 'New Approved Appointment',
          html: `
            <p>Dear Dr. ${doctor.name},</p>
            <p>You have a new approved appointment on <strong>${bookingDetails.date}</strong> at <strong>${bookingDetails.time}</strong>.</p>
            <p>Patient: ${bookingDetails.name}</p>
            <p>Payment ID: ${razorpay_payment_id}</p>
            <p>This appointment has been automatically approved as payment was successful.</p>
          `
        };
        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error('Failed to send email to doctor:', emailErr);
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
