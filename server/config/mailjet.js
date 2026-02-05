const nodemailer = require('nodemailer');
require('dotenv').config();

const mailjetUser = process.env.MAILJET_API_KEY;
const mailjetPass = process.env.MAILJET_SECRET_KEY;

console.log("--- Mailjet SMTP Configuration Check ---");
console.log(`API Key: ${mailjetUser ? mailjetUser.substring(0, 10) + '...' : 'Missing'}`);
console.log(`Secret Key Check: ${mailjetPass ? mailjetPass.substring(0, 10) + '...' : 'Missing'}`);

if (!mailjetUser || !mailjetPass) {
  console.error("❌ Mailjet configuration missing in .env file. Please check MAILJET_API_KEY and MAILJET_SECRET_KEY.");
}

const transporter = nodemailer.createTransport({
  host: "in-v3.mailjet.com",
  port: 587,
  secure: false,
  auth: {
    user: mailjetUser ? mailjetUser.trim() : '',
    pass: mailjetPass ? mailjetPass.trim() : ''
  },
});

// Verify connection configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ SMTP Connection Error:", error.message);
  } else {
    console.log("✅ SMTP Server is ready");
    console.log(`   Authenticated as: ${mailjetUser}`);
  }
});

module.exports = transporter;
