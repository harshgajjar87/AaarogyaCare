const Query = require('../models/Query');
const { sendEmail } = require('../config/mailjetAPI');

// Submit contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email address' 
      });
    }

    // Check if user is logged in (optional - from auth middleware if present)
    const userId = req.user?._id || null;

    // Save query to database
    const newQuery = new Query({
      name,
      email,
      subject,
      message,
      userId // Will be null if user is not logged in
    });

    await newQuery.save();

    // Send email notification to admin
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">New Contact Query Received</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          ${userId ? `<p><strong>User ID:</strong> ${userId} (Registered User)</p>` : '<p><em>Submitted by guest user</em></p>'}
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #2c5aa0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
          <p>Please respond to this query as soon as possible.</p>
        </div>
      `;

      await sendEmail({
        to: 'AarogyaCare55@gmail.com',
        subject: `New Contact Query: ${subject}`,
        html: html
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Continue even if email fails - the query is still saved in database
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.'
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// Get all queries for admin
exports.getQueries = async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch queries' 
    });
  }
};
