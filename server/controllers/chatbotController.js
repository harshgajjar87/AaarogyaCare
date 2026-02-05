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
    let response = "I'm sorry, I didn't understand that. You can ask me about booking appointments, viewing reports, or finding doctors.";

    if (lowerMsg.match(/hello|hi|hey/)) {
      response = "Hello! I'm your AarogyaCare assistant. How can I help you today?";
    } else if (lowerMsg.includes('appointment') || lowerMsg.includes('book')) {
      response = "To book an appointment, go to the 'Find a Doctor' section on your dashboard, select a doctor, and click 'Book Appointment'.";
    } else if (lowerMsg.includes('report') || lowerMsg.includes('result')) {
      response = "You can view and download your medical reports in the 'Medical Reports' section of your dashboard.";
    } else if (lowerMsg.includes('doctor') || lowerMsg.includes('search')) {
      response = "You can browse our list of qualified doctors on the dashboard. Use the filters to find a specialist near you.";
    } else if (lowerMsg.includes('contact') || lowerMsg.includes('support') || lowerMsg.includes('help')) {
      response = "You can contact our support team at support@aarogyacare.com or use the contact form in the About page.";
    } else if (lowerMsg.includes('thank')) {
      response = "You're welcome! Stay healthy.";
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
          content: `You are a helpful and empathetic healthcare assistant for the AarogyaCare platform. 
          Your goal is to assist patients with navigating the website, understanding features, and providing general health information.
          
          Key Platform Features:
          1. **Book Appointments**: Patients can find doctors by specialization and book slots.
          2. **Medical Reports**: Patients can view and download reports uploaded by doctors.
          3. **Doctor Search**: Patients can filter doctors by specialization, rating, and fee.
          4. **Chat**: Patients can chat with doctors after an appointment is approved.
          
          Guidelines:
          - Be concise, professional, and reassuring.
          - If asked about medical advice, clarify that you are an AI and they should consult a doctor on the platform.
          - If asked about technical support, direct them to support@aarogyacare.com.
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