const OpenAI = require('openai');

// Initialize OpenAI client
// Ensure you have OPENAI_API_KEY in your .env file
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

exports.chat = async (req, res) => {
  const { message } = req.body;

  // Fallback logic function in case OpenAI is down or not configured
  const fallbackResponse = () => {
    const lowerMsg = message ? message.toLowerCase() : '';
    let response = "I'm sorry, I didn't quite understand your question. However, I'm here to help you with AarogyaCare! You can ask me about booking appointments, viewing medical reports, finding doctors, using AI health tools, or navigating the platform. What would you like to know?";

    if (lowerMsg.match(/hello|hi|hey|greet/)) {
      response = "Hello and welcome to AarogyaCare! I'm your virtual healthcare assistant. I can help you with booking appointments, finding doctors, accessing medical reports, using our AI health tools, or navigating the platform. How may I assist you today?";
    } else if (lowerMsg.includes('appointment') || lowerMsg.includes('book')) {
      response = "To book an appointment, go to your Dashboard and click on 'Find Doctors'. You can filter doctors by specialization, rating, and fees. Once you find the right doctor, click on their profile and select 'Book Appointment' to choose a time slot. Would you like help finding a specific type of doctor?";
    } else if (lowerMsg.includes('report') || lowerMsg.includes('result') || lowerMsg.includes('medical record')) {
      response = "You can access all your medical reports in the 'Medical Reports' section of your dashboard. Reports uploaded by your doctors are stored securely there, and you can view or download them anytime. You'll also find prescriptions in the 'Prescriptions' section.";
    } else if (lowerMsg.includes('doctor') || lowerMsg.includes('search') || lowerMsg.includes('find')) {
      response = "You can find doctors in the 'Find Doctors' section on your dashboard. Use filters to search by specialization (like cardiology, dermatology, pediatrics), ratings, consultation fees, and location. Each doctor's profile shows their qualifications, experience, and patient reviews.";
    } else if (lowerMsg.includes('chat') || lowerMsg.includes('message') || lowerMsg.includes('talk')) {
      response = "You can chat with doctors after your appointment is approved! Go to the 'Chat with Doctors' section in your dashboard to see your conversations. We also have AI-powered chat tools - check out 'Chat with AI Doctor' or 'Voice Call with AI Doctor' for immediate assistance.";
    } else if (lowerMsg.includes('payment') || lowerMsg.includes('pay') || lowerMsg.includes('transaction')) {
      response = "You can view all your payment transactions in the 'Payment History' page. It shows details of all payments made for appointments and consultations. Access it from your dashboard menu.";
    } else if (lowerMsg.includes('ai') || lowerMsg.includes('health risk') || lowerMsg.includes('symptom')) {
      response = "We have several AI-powered health tools! Try the 'Health Risk Calculator' to assess your health risks, 'Symptom Checker' to check symptoms, 'Chat with AI Doctor' for text conversations, or 'Voice Call with AI Doctor' for voice consultations. All available from your dashboard.";
    } else if (lowerMsg.includes('register') || lowerMsg.includes('sign up') || lowerMsg.includes('create account')) {
      response = "To register, click on 'Register as Patient' button on the home page if you're a patient, or 'Register as Doctor' if you're a healthcare professional. Doctors will need to complete a verification process after registration.";
    } else if (lowerMsg.includes('prescription')) {
      response = "You can view all your prescriptions in the 'Prescriptions' section of your dashboard. Doctors create prescriptions after consultations, and you'll receive notifications when new prescriptions are added.";
    } else if (lowerMsg.includes('notification')) {
      response = "Check the 'Notifications' section (bell icon) in your dashboard to see updates about appointments, messages from doctors, prescription updates, and other important alerts.";
    } else if (lowerMsg.includes('profile') || lowerMsg.includes('update') || lowerMsg.includes('edit')) {
      response = "You can update your profile information in the 'Profile' section. There you can edit your personal details, contact information, and upload a profile picture.";
    } else if (lowerMsg.includes('contact') || lowerMsg.includes('support') || lowerMsg.includes('help')) {
      response = "For support, you can email us at aarogyacare55@gmail.com or call +91 999 888 7777. You can also visit the 'About' page for more information. I'm here to help with any questions about using the platform!";
    } else if (lowerMsg.includes('thank')) {
      response = "You're very welcome! I'm here anytime you need help with AarogyaCare. Stay healthy and don't hesitate to reach out if you have more questions!";
    }
    return response;
  };

  try {
    // Check if API key is configured
    if (!openai) {
      console.warn('OpenAI client not initialized, using fallback logic.');
      return res.json({ reply: fallbackResponse() });
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: `You are a warm, caring, and empathetic healthcare assistant for AarogyaCare. Communicate like a friendly human healthcare professional, not a robot.
          
          PLATFORM FEATURES & NAVIGATION:
          
          **For Patients:**
          1. **Dashboard** - View overview of appointments, doctors, and reports
          2. **Find Doctors** - Search and filter doctors by specialization, rating, fees, and location
          3. **Book Appointments** - Select a doctor, choose time slot, and book appointments
          4. **My Appointments** - View all upcoming and past appointments
          5. **Medical Reports** - Access and download reports uploaded by doctors
          6. **Prescriptions** - View prescriptions from doctors
          7. **Payment History** - Track all payment transactions
          8. **Chat with Doctors** - Message doctors after appointment approval
          9. **Profile** - Update personal information and profile picture
          10. **Notifications** - Receive updates about appointments and messages
          
          **AI-Powered Health Tools:**
          1. **Health Risk Calculator** - Assess health risks based on lifestyle factors
          2. **Chat with AI Doctor** - Text conversation with AI for symptom discussion
          3. **Voice Call with AI Doctor** - Voice conversation with AI doctor
          4. **Symptom Checker** - Check symptoms and get recommendations
          5. **Health Prediction** - Get health predictions based on data
          
          **For Doctors:**
          1. **Doctor Dashboard** - Overview of appointments, patients, and analytics
          2. **Appointments** - Manage patient appointments
          3. **Patients** - View patient list and details
          4. **Upload Reports** - Upload medical reports for patients
          5. **Prescriptions** - Create and manage prescriptions
          6. **Reviews** - View patient reviews and ratings
          7. **Analytics** - View performance metrics and statistics
          8. **Chat with Patients** - Communicate with patients
          
          **Registration:**
          - "Register as Patient" button - For patients to create account
          - "Register as Doctor" button - For doctors to join the platform
          - Doctor verification process required after registration
          
          **Key Pages:**
          - Home page with features overview
          - About page with platform information
          - Privacy Policy page
          - Login/Register pages
          
          COMMUNICATION STYLE:
          - Speak naturally and conversationally, like a caring healthcare professional
          - Show genuine concern and empathy for health concerns
          - Ask follow-up questions to understand situations better
          - Keep responses 2-3 sentences - helpful but not overwhelming
          - Use warm language: "I understand", "I'm here to help", "That must be concerning"
          - When users ask about features, guide them to the exact button/page name
          - For navigation help, mention specific dashboard sections or buttons
          - If medical advice needed, encourage booking an appointment with a real doctor
          - Never give medical diagnoses, but show understanding and guide to proper care
          - If the user's query is complex or requires human support, mention they can create a support ticket for personalized assistance
          
          RESPONSE GUIDELINES:
          - When asked "how to book appointment": Mention going to "Find Doctors" section, filtering by specialization, selecting a doctor, and clicking "Book Appointment"
          - When asked about reports: Direct to "Medical Reports" section in dashboard
          - When asked about payments: Direct to "Payment History" page
          - When asked about chatting with doctors: Explain they can chat after appointment is approved
          - When asked about AI tools: Mention "Health Risk Calculator", "Chat with AI Doctor", "Voice Call with AI Doctor", "Symptom Checker"
          - When asked about registration: Mention "Register as Patient" or "Register as Doctor" buttons on home page
          - For complex issues or complaints: Suggest creating a support ticket for personalized help from the team
          - Always use exact button/page names from the platform
          ` 
        },
        { role: "user", content: message }
      ],
      model: "gpt-3.5-turbo",
    });

    const botReply = completion.choices[0].message.content;
    res.json({ reply: botReply });
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    // Use fallback logic if OpenAI fails
    res.json({ reply: fallbackResponse() });
  }
};