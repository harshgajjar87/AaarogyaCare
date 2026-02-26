const axios = require('axios');
const User = require('../models/User');

// Try to use Gemini if available, fallback to Groq
let useGemini = false;
let genAI = null;

try {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  if (process.env.GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    useGemini = true;
  }
} catch (e) {
  console.log('Gemini not available, using Groq');
}

const SYSTEM_PROMPT = `You are a medical triage nurse. Your job is to ask ONE question at a time to understand the patient's condition.

Rules:
1. Ask ONLY ONE question per response
2. Focus on: symptom location, duration, severity (1-10), and related symptoms
3. Keep questions short and clear
4. After gathering enough info (minimum 3-4 key details), respond with ONLY this JSON:
{"specialization": "Cardiologist"}

Valid specializations: Cardiologist, Dermatologist, Neurologist, Orthopedic, Pediatrician, Psychiatrist, General Physician, ENT Specialist, Gynecologist, Ophthalmologist

Do NOT add any text before or after the JSON when you determine specialization.`;

exports.triageChat = async (req, res) => {
  try {
    const { message, history = [], language = 'english' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const languageInstructions = {
      english: 'Respond in English.',
      hindi: 'Respond in Hindi (Devanagari script). Use simple Hindi words.',
      gujarati: 'Respond in Gujarati (Gujarati script). Use simple Gujarati words.'
    };

    const systemPrompt = `You are a caring medical triage assistant. ${languageInstructions[language] || languageInstructions.english}

Communication Style:
- Be warm, empathetic, and conversational like a real nurse
- Ask ONE clear question at a time (10-15 words)
- Show genuine concern: "I understand", "I'm here to help", "Let me help you find the right doctor"
- When greeting, be friendly: "Hello! I'm here to help you. Could you tell me what's bothering you today?"
- For symptoms, ask naturally: "I see. Can you tell me where exactly you're feeling this discomfort?"
- For duration: "How long have you been experiencing this?"
- For severity: "On a scale of 1 to 10, how would you rate the pain?"
- Show empathy: "That sounds uncomfortable. Have you noticed any other symptoms like fever or nausea?"

IMPORTANT - Handling Off-Topic Questions:
- If user asks non-medical questions (like "what is your identity", "who are you", general questions), answer briefly in 2-3 lines
- Then gently redirect to symptoms: "Now, let's focus on your health. What symptoms are you experiencing today?"
- Examples:
  User: "what is your identity"
  Bot: "I'm a medical triage assistant here to help you find the right doctor for your health concerns. I'll ask you a few questions about your symptoms to recommend the best specialist. Now, what's bringing you here today? Are you experiencing any discomfort or symptoms?"
  
  User: "what is atarot" 
  Bot: "I'm not familiar with that term in a medical context. It might be a typo or something unrelated to health. Let me help you with your health concerns instead - are you experiencing any symptoms or discomfort that I can help you with?"

After gathering key info (symptom, location, duration, severity), recommend specialist:
"Based on what you've told me, I'd recommend consulting a [Specialist]. Would you like to see available doctors?"

Then add: [SPECIALIST:SpecialistName]

Specialists: Cardiologist, Dermatologist, Neurologist, Orthopedic, Pediatrician, Psychiatrist, General Physician, ENT Specialist, Gynecologist, Ophthalmologist

Be human, caring, and helpful - not robotic. Always try to redirect to health concerns.`;

    let aiResponse;

    // Try Gemini first if available
    if (useGemini && genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const chatHistory = [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'OK. 5-8 words only.' }] }
        ];
        history.forEach(msg => {
          chatHistory.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          });
        });
        const chat = model.startChat({ 
          history: chatHistory,
          generationConfig: {
            maxOutputTokens: 50,
            temperature: 0.3
          }
        });
        const result = await chat.sendMessage(message);
        aiResponse = result.response.text();
      } catch (geminiError) {
        console.log('Gemini failed, falling back to Groq:', geminiError.message);
        useGemini = false; // Disable for future requests
      }
    }

    // Fallback to Groq if Gemini not available or failed
    if (!aiResponse) {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ];

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-8b-instant',
          messages,
          temperature: 0.3,
          max_tokens: 50
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      aiResponse = response.data.choices[0].message.content;
    }

    // Extract specialist tag and clean response
    let specialization = null;
    let cleanResponse = aiResponse;
    
    // Truncate if AI ignores instructions
    if (cleanResponse.length > 150) {
      const sentences = cleanResponse.split(/[.!?]/);
      cleanResponse = sentences.slice(0, 2).join('. ') + (cleanResponse.includes('?') ? '' : '.');
    }
    
    // Check for [SPECIALIST:Name] tag
    const specialistMatch = aiResponse.match(/\[SPECIALIST:([^\]]+)\]/);
    if (specialistMatch) {
      specialization = specialistMatch[1];
      // Remove the tag from response
      cleanResponse = aiResponse.replace(/\[SPECIALIST:[^\]]+\]/g, '').trim();
    }
    
    // Fallback: Check for JSON format (hide it from user)
    if (!specialization && aiResponse.includes('"specialization"')) {
      const jsonMatch = aiResponse.match(/\{[^}]*"specialization"[^}]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          specialization = parsed.specialization;
          // Remove JSON from response
          cleanResponse = aiResponse.replace(/\{[^}]*"specialization"[^}]*\}/g, '').trim();
        } catch (e) {}
      }
    }
    
    // Fallback: Natural language detection
    if (!specialization) {
      const specialists = ['Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic', 'Pediatrician', 'Psychiatrist', 'General Physician', 'ENT Specialist', 'Gynecologist', 'Ophthalmologist'];
      const lowerResponse = aiResponse.toLowerCase();
      
      if (lowerResponse.includes('recommend') || lowerResponse.includes('consult') || lowerResponse.includes('see a')) {
        for (const spec of specialists) {
          if (lowerResponse.includes(spec.toLowerCase())) {
            specialization = spec;
            break;
          }
        }
      }
    }

    if (specialization) {
      return res.json({
        message: cleanResponse,
        specialization: specialization,
        completed: true
      });
    }

    res.json({ message: cleanResponse, completed: false });
  } catch (error) {
    console.error('Triage error:', error.message);
    res.status(500).json({ 
      error: 'AI service error',
      details: error.message
    });
  }
};

exports.findDoctors = async (req, res) => {
  try {
    const { specialization, latitude, longitude } = req.body;

    const query = {
      role: 'doctor',
      isActive: true,
      'doctorDetails.specialization': new RegExp(specialization, 'i')
    };

    let doctors = await User.find(query)
      .select('name email profileImage doctorDetails location')
      .limit(10);

    // Sort by location if coordinates provided
    if (latitude && longitude) {
      doctors = await User.find(query)
        .select('name email profileImage doctorDetails location')
        .near('location', {
          center: [longitude, latitude],
          maxDistance: 50000 // 50km
        })
        .limit(10);
    }

    res.json({ doctors });
  } catch (error) {
    console.error('Find doctors error:', error);
    res.status(500).json({ error: 'Failed to find doctors' });
  }
};
