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
    let response = "I'm sorry, I didn't quite understand your question. However, I'm here to help you with various aspects of AarogyaCare! You can ask me about booking appointments with our qualified doctors, viewing and downloading your medical reports, finding specialists in different fields, or getting assistance with any platform features. Feel free to ask me anything related to your healthcare journey with us.";

    if (lowerMsg.match(/hello|hi|hey/)) {
      response = "Hello and welcome to AarogyaCare! I'm your virtual healthcare assistant, here to make your experience smooth and helpful. Whether you need to book an appointment, find a specialist, access your medical reports, or learn about our platform features, I'm here to guide you every step of the way. How may I assist you today?";
    } else if (lowerMsg.includes('appointment') || lowerMsg.includes('book')) {
      response = "Booking an appointment with AarogyaCare is simple and convenient! First, navigate to the 'Find a Doctor' section on your dashboard where you can browse through our network of qualified healthcare professionals. You can filter doctors by specialization, location, ratings, and consultation fees to find the perfect match for your needs. Once you've selected a doctor, click on their profile to view available time slots and book your appointment. The system will guide you through the payment process, and you'll receive confirmation once your appointment is successfully scheduled.";
    } else if (lowerMsg.includes('report') || lowerMsg.includes('result')) {
      response = "Your medical reports are securely stored and easily accessible on AarogyaCare! To view your reports, simply go to the 'Medical Reports' section in your patient dashboard. Here you'll find all reports uploaded by your doctors, organized by date for your convenience. You can view reports online or download them as PDF files for your personal records. Each report includes detailed information from your consultations, test results, and any medical documentation your healthcare provider has shared with you.";
    } else if (lowerMsg.includes('doctor') || lowerMsg.includes('search')) {
      response = "Finding the right doctor for your needs is easy with AarogyaCare's comprehensive search system! Our platform features a diverse network of qualified doctors across various specializations including cardiology, dermatology, pediatrics, orthopedics, and many more. You can use our advanced filters to search by specialization, years of experience, patient ratings, consultation fees, and location. Each doctor's profile includes their qualifications, experience, clinic details, patient reviews, and available time slots, helping you make an informed decision about your healthcare.";
    } else if (lowerMsg.includes('contact') || lowerMsg.includes('support') || lowerMsg.includes('help')) {
      response = "We're here to support you every step of the way! If you need technical assistance, have questions about your account, or require help with any platform features, our dedicated support team is ready to help. You can reach us via email at support@aarogyacare.com, and we'll respond to your inquiry as quickly as possible. Additionally, you can use the contact form available on our About page to send us detailed messages about your concerns. For immediate assistance with common issues, feel free to continue chatting with me, and I'll do my best to help!";
    } else if (lowerMsg.includes('thank')) {
      response = "You're very welcome! It's my pleasure to assist you with your healthcare needs. Remember, AarogyaCare is here for you 24/7, whether you need to book appointments, access medical records, or get guidance on using our platform. Stay healthy, take care of yourself, and don't hesitate to reach out whenever you need assistance. Wishing you good health and wellness!";
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
          
          Key Platform Features:
          1. **Book Appointments**: Patients can find doctors by specialization and book slots.
          2. **Medical Reports**: Patients can view and download reports uploaded by doctors.
          3. **Doctor Search**: Patients can filter doctors by specialization, rating, and fee.
          4. **Chat**: Patients can chat with doctors after an appointment is approved.
          
          Communication Style:
          - Speak naturally and conversationally, like a caring healthcare professional would.
          - Show genuine concern and empathy when patients describe symptoms or health concerns.
          - Ask follow-up questions to understand their situation better (e.g., "Can you tell me more about where exactly you're feeling the pain?" or "How long have you been experiencing these symptoms?").
          - Provide responses that are 2-3 sentences long - enough to be helpful and caring, but not overwhelming.
          - Use warm, reassuring language like "I understand", "I'm here to help", "That must be concerning".
          - When asking about symptoms, be specific and caring: "Could you describe the pain for me? Is it sharp, dull, or throbbing? And which area is affected?"
          - Balance being informative with being conversational - avoid sounding too formal or robotic.
          - If medical advice is needed, gently encourage them to book an appointment: "I'd recommend speaking with one of our doctors about this. Would you like help booking an appointment?"
          - Never give medical diagnoses, but show understanding and guide them to proper care.
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