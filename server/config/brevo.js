const nodemailer = require('nodemailer');
require('dotenv').config();

const brevoUser = process.env.BREVO_USER;
const brevoKey = process.env.BREVO_API_KEY;

console.log("--- Brevo SMTP Configuration Check ---");
console.log(`User: ${brevoUser}`);
console.log(`Key Check: ${brevoKey ? brevoKey.substring(0, 10) + '...' : 'Missing'}`);

if (!brevoUser || !brevoKey) {
  console.error("❌ Brevo configuration missing in .env file. Please check BREVO_USER and BREVO_API_KEY.");
} else if (brevoKey.includes('#')) {
  console.warn("⚠️ Warning: BREVO_API_KEY contains a '#'. This often happens if a comment is on the same line in .env. Please move comments to a new line.");
} else if (brevoKey.startsWith('xkeysib')) {
  console.error("❌ Error: You are using a Brevo API Key (starts with 'xkeysib'). Nodemailer requires the SMTP Key (starts with 'xsmtp'). Please update BREVO_API_KEY in your .env file.");
} else if (!brevoKey.startsWith('xsmtp')) {
  console.warn("⚠️ Warning: BREVO_API_KEY does not start with 'xsmtp'. Ensure you are using the SMTP Key from Brevo (Sendinblue), not the API v3 key.");
}

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: brevoUser ? brevoUser.trim() : '',
    pass: brevoKey ? brevoKey.trim() : ''
  },
});

// Verify connection configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ SMTP Connection Error:", error.message);
  } else {
    console.log("✅ SMTP Server is ready");
    console.log(`   Authenticated as: ${brevoUser}`);
  }
});

module.exports = transporter;