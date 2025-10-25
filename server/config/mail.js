const sgMail = require('@sendgrid/mail');

// Set the API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Create a transporter-like object for compatibility
const transporter = {
  sendMail: async (mailOptions) => {
    const msg = {
      to: mailOptions.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'harshgajjar062@gmail.com', // You'll need to verify this email in SendGrid
      subject: mailOptions.subject,
      html: mailOptions.html || mailOptions.text,
    };

    try {
      await sgMail.send(msg);
      console.log('Email sent successfully via SendGrid');
    } catch (error) {
      console.error('SendGrid error:', error);
      throw error;
    }
  }
};

module.exports = transporter;
