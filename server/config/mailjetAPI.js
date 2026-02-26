const Mailjet = require('node-mailjet');
require('dotenv').config();

const mailjetApiKey = process.env.MAILJET_API_KEY;
const mailjetSecretKey = process.env.MAILJET_SECRET_KEY;

console.log("--- Mailjet API Configuration Check ---");
console.log(`API Key: ${mailjetApiKey ? mailjetApiKey.substring(0, 10) + '...' : 'Missing'}`);
console.log(`Secret Key: ${mailjetSecretKey ? mailjetSecretKey.substring(0, 10) + '...' : 'Missing'}`);

if (!mailjetApiKey || !mailjetSecretKey) {
  console.error("❌ Mailjet configuration missing. Please check MAILJET_API_KEY and MAILJET_SECRET_KEY.");
  throw new Error('Mailjet credentials are required.');
}

const mailjet = Mailjet.apiConnect(
  mailjetApiKey.trim(),
  mailjetSecretKey.trim()
);

// Test function to send email using Mailjet API
const sendEmail = async ({ to, subject, html, from = process.env.MAIL_USER }) => {
  try {
    const request = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: from,
              Name: 'Aarogya Clinic'
            },
            To: [
              {
                Email: to
              }
            ],
            Subject: subject,
            HTMLPart: html
          }
        ]
      });

    console.log(`✅ Email sent successfully to ${to}`);
    return { success: true, response: request.body };
  } catch (error) {
    console.error('❌ Mailjet API Error:', error.statusCode, error.message);
    throw error;
  }
};

console.log("✅ Mailjet API client initialized");

module.exports = { sendEmail, mailjet };
