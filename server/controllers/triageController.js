const axios = require('axios');
const User = require('../models/User');

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
      hindi: 'Respond in Hindi (Devanagari script). Use simple, conversational Hindi. Keep responses short.',
      gujarati: 'Respond in Gujarati (Gujarati script). Use simple, conversational Gujarati. Keep responses short.'
    };

    const greetings = {
      english: "Hello! I'm here to help you. Could you tell me what's bothering you today?",
      hindi: "नमस्ते! मैं आपकी मदद के लिए यहां हूं। आज आपको क्या परेशानी है?",
      gujarati: "નમસ્તે! હું તમને મદદ કરવા માટે અહીં છું. આજે તમને શું તકલીફ છે?"
    };

    const systemPrompt = `You are Dr. Aarogya, a caring and professional medical triage assistant. ${languageInstructions[language] || languageInstructions.english}

CRITICAL RULES:
1. Ask ONLY ONE question per response (maximum 15 words)
2. NEVER repeat the same question twice
3. Progress through the conversation naturally
4. Keep responses SHORT and conversational for voice/text chat

Communication Style:
- Be warm, empathetic, and conversational like a real doctor and real human being
- Speak naturally as if having a real conversation
- Show genuine concern: "I understand", "I see", "That must be concerning","Ohh","Ahhh","Got it"
- Acknowledge or reply what the patient says before asking the next question
- Use varied questions - don't repeat yourself

Question Flow (ask in this order, ONE at a time):
1. First response: "${greetings[language]}"
2. After symptom mentioned: "I see. Where exactly are you feeling this?" OR "Can you tell me where the pain is located?"
3. After location: "How long have you been experiencing this?" OR "When did this start?"
4. After duration: "On a scale of 1 to 10, how severe is it?" OR "How would you rate the intensity?"
5. After severity: "Have you noticed any other symptoms?" OR "Are there any other issues you're experiencing?"
6. After gathering info: Recommend specialist

Examples of Natural Conversation:
Patient: "I have a headache"
You: "I understand. Where exactly is the headache located?"

Patient: "On the left side of my head"
You: "I see. How long have you been having this headache?"

Patient: "For about 3 days"
You: "That must be uncomfortable. On a scale of 1 to 10, how severe is the pain?"

Patient: "About 7"
You: "I understand. Have you noticed any other symptoms like nausea or vision problems?"

Patient: "Yes, some nausea"
You: "Based on what you've told me, I'd recommend consulting a Neurologist for your headache and nausea. Would you like to see available doctors? [SPECIALIST:Neurologist]"

IMPORTANT - Handling Off-Topic Questions:
- If user asks non-medical questions,still answer briefly (2 - 3 sentences)
- Then redirect: "Now, let's focus on your health. What's bothering you today?"
- Example:
  User: "who are you"
  You: "I'm Dr. Aarogya, your medical assistant. I help connect you with the right specialist. What symptoms are you experiencing?"

After gathering key info (symptom, location, duration, severity), recommend specialist:
"Based on what you've told me, I'd recommend consulting a [Specialist]. Would you like to see available doctors?"

Then add: [SPECIALIST:SpecialistName]

Valid Specialists: Cardiologist, Dermatologist, Neurologist, Orthopedic, Pediatrician, Psychiatrist, General Physician, ENT Specialist, Gynecologist, Ophthalmologist

REMEMBER: 
- ONE question at a time
- NEVER repeat questions
- Keep responses under 15 words
- Be conversational and natural
- Progress through the flow systematically`;

    let aiResponse;

    // Build conversation history
    const conversationText = history.map(h => `${h.role === 'user' ? 'Patient' : 'Assistant'}: ${h.content}`).join('\n');
    const fullPrompt = `${systemPrompt}\n\nConversation so far:\n${conversationText}\n\nPatient: ${message}\n\nAssistant:`;

    // Try Gemini 2.0 Flash first
    if (process.env.GOOGLE_API_KEY) {
      try {
        console.log('Attempting Gemini API for triage...');
        
        const geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_API_KEY}`,
          {
            contents: [{
              parts: [{ text: fullPrompt }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 100
            }
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

        aiResponse = geminiResponse.data.candidates[0].content.parts[0].text;
        console.log('Gemini API succeeded for triage');
        
      } catch (geminiError) {
        console.log('Gemini failed for triage, falling back to Groq:', geminiError.message);
      }
    }

    // Fallback to Groq if Gemini not available or failed
    if (!aiResponse && process.env.GROQ_API_KEY) {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ];

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.3,
          max_tokens: 100
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      aiResponse = response.data.choices[0].message.content;
      console.log('Groq API succeeded for triage');
    }

    if (!aiResponse) {
      return res.status(500).json({ error: 'AI services unavailable' });
    }

    // Extract specialist tag and clean response
    let specialization = null;
    let cleanResponse = aiResponse.trim();
    
    // Check for [SPECIALIST:Name] tag first
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
    
    // Truncate if AI ignores instructions (only if no specialist found)
    if (!specialization && cleanResponse.length > 200) {
      // Keep first 2 sentences or first question
      const sentences = cleanResponse.split(/[.!?]+/);
      if (sentences.length > 0) {
        // Find first question or take first 2 sentences
        const firstQuestion = sentences.find(s => s.trim().includes('?'));
        if (firstQuestion) {
          cleanResponse = firstQuestion.trim() + '?';
        } else {
          cleanResponse = sentences.slice(0, 2).join('. ').trim() + '.';
        }
      }
    }
    
    console.log('AI Response:', cleanResponse);
    console.log('Specialization detected:', specialization || 'none');

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
