const axios = require('axios');
const User = require('../models/User');

// Server-side symptom to specialist mapping — overrides AI guesses
const symptomSpecialistMap = [
  { keywords: ['chest pain', 'heart', 'palpitation', 'breathless', 'shortness of breath', 'blood pressure', 'cardiac'], specialist: 'Cardiologist' },
  { keywords: ['skin', 'rash', 'acne', 'itch', 'itching', 'eczema', 'psoriasis', 'hair loss', 'nail'], specialist: 'Dermatologist' },
  { keywords: ['headache', 'migraine', 'seizure', 'numbness', 'dizziness', 'memory', 'nerve', 'paralysis', 'stroke'], specialist: 'Neurologist' },
  { keywords: ['bone', 'joint', 'knee', 'back pain', 'spine', 'fracture', 'muscle pain', 'shoulder', 'hip', 'ankle', 'wrist'], specialist: 'Orthopedic' },
  { keywords: ['child', 'baby', 'infant', 'toddler', 'kid', 'pediatric'], specialist: 'Pediatrician' },
  { keywords: ['anxiety', 'depression', 'stress', 'mental', 'sleep disorder', 'panic', 'mood', 'psychiatric'], specialist: 'Psychiatrist' },
  { keywords: ['ear', 'nose', 'throat', 'sinus', 'tonsil', 'hearing', 'snoring', 'nasal'], specialist: 'ENT Specialist' },
  { keywords: ['eye', 'vision', 'blur', 'cataract', 'glaucoma', 'retina', 'sight'], specialist: 'Ophthalmologist' },
  { keywords: ['period', 'menstrual', 'pregnancy', 'ovary', 'uterus', 'vaginal', 'gynec', 'female reproductive'], specialist: 'Gynecologist' },
  { keywords: ['stomach', 'abdomen', 'vomit', 'nausea', 'diarrhea', 'constipation', 'gastric', 'acidity', 'digestion', 'liver', 'bowel', 'bloating'], specialist: 'General Physician' },
  { keywords: ['fever', 'cold', 'cough', 'flu', 'fatigue', 'weakness', 'infection', 'diabetes', 'thyroid', 'weight'], specialist: 'General Physician' },
];

const detectSpecialistFromSymptoms = (conversationText) => {
  const lower = conversationText.toLowerCase();
  for (const entry of symptomSpecialistMap) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.specialist;
    }
  }
  return null;
};

exports.triageChat = async (req, res) => {
  try {
    const { message, history = [], language = 'english' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const languageInstructions = {
      english: 'Respond in English.',
      hindi: 'Respond in Hindi (Devanagari script). Use simple, conversational Hindi.',
      gujarati: 'Respond in Gujarati (Gujarati script). Use simple, conversational Gujarati.'
    };

    const systemPrompt = `You are Dr. Aarogya, a caring medical triage assistant. ${languageInstructions[language] || languageInstructions.english}

CRITICAL RULES:
1. Ask ONLY ONE question per response
2. NEVER repeat a question already asked in the conversation
3. NEVER ask "where is the nausea/vomiting located" — nausea/vomiting has no location
4. Keep responses SHORT (under 40 words)
5. Be warm and empathetic and answer about all the question warmly like hello, how are you or greeting related questions and behave how a doctor wants to know about patient history for diagnose the issue.

SMART QUESTION FLOW — adapt based on the symptom:
- For PAIN symptoms: ask location → duration → severity (1-10) → other symptoms
- For NAUSEA/VOMITING: ask duration → severity → triggers (food/motion/stress) → other symptoms  
- For FEVER/COLD/COUGH: ask duration → severity → other symptoms
- For SKIN issues: ask location on body → duration → other symptoms
- For MENTAL symptoms: ask duration → impact on daily life → other symptoms

After collecting: symptom + duration + severity → recommend specialist with tag [SPECIALIST:Name]

Valid Specialists: Cardiologist, Dermatologist, Neurologist, Orthopedic, Pediatrician, Psychiatrist, General Physician, ENT Specialist, Gynecologist, Ophthalmologist

Example for nausea:
Patient: "I feel like vomiting"
You: "I'm sorry to hear that. How long have you been feeling nauseous?"
Patient: "2 days"
You: "On a scale of 1 to 10, how severe is it?"
Patient: "7"
You: "Got it. Have you noticed any triggers like certain foods or motion sickness?"
Patient: "no"
You: "Based on your symptoms, I'd recommend a General Physician. [SPECIALIST:General Physician]"

REMEMBER: ONE question, no repeats, adapt to the symptom type.`;

    let aiResponse;

    // Build conversation history for Groq (most reliable for context)
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content })),
      { role: 'user', content: message }
    ];

    // Try Groq first (better at following instructions with history)
    if (process.env.GROQ_API_KEY) {
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.3-70b-versatile',
            messages,
            temperature: 0.4,
            max_tokens: 150
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
      } catch (groqError) {
        console.log('Groq failed for triage, falling back to Gemini:', groqError.message);
      }
    }

    // Fallback to Gemini if Groq failed
    if (!aiResponse && process.env.GOOGLE_API_KEY) {
      try {
        console.log('Attempting Gemini API for triage...');
        const geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_API_KEY}`,
          {
            contents: messages.filter(m => m.role !== 'system').map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            })),
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.4, maxOutputTokens: 150 }
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        aiResponse = geminiResponse.data.candidates[0].content.parts[0].text;
        console.log('Gemini API succeeded for triage');
      } catch (geminiError) {
        console.log('Gemini failed for triage:', geminiError.message);
      }
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
    
    // Server-side specialist override — don't trust AI's specialist choice alone
    if (specialization) {
      const fullConversation = [
        ...history.map(h => h.content),
        message
      ].join(' ');
      const detectedSpecialist = detectSpecialistFromSymptoms(fullConversation);
      if (detectedSpecialist) {
        specialization = detectedSpecialist; // Use our mapping, not AI's guess
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
