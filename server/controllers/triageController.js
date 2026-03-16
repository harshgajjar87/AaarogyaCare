const axios = require('axios');
const User = require('../models/User');

// Red flag keywords that indicate potential emergencies
const redFlags = ['chest pain', 'cannot breathe', 'can\'t breathe', 'shortness of breath', 'difficulty breathing', 'fainting', 'fainted', 'heavy bleeding', 'stroke', 'sudden weakness', 'unconscious', 'severe bleeding'];

// Multi-factor specialist mapping — higher entries take priority
// Entries with a `context` array require BOTH keywords AND context words to match
const symptomSpecialistMap = [
  // Gynecologist — high priority, context-aware override
  { keywords: ['period', 'menstrual', 'pregnancy', 'ovary', 'uterus', 'vaginal', 'gynec', 'female reproductive', 'pregnant'], specialist: 'Gynecologist' },
  // Stomach/abdomen in pregnancy context → Gynecologist
  { keywords: ['stomach', 'abdomen', 'cramp', 'pelvic'], context: ['pregnant', 'pregnancy', 'period', 'menstrual'], specialist: 'Gynecologist' },
  // Cardiology
  { keywords: ['chest pain', 'heart', 'palpitation', 'breathless', 'shortness of breath', 'blood pressure', 'cardiac', 'angina'], specialist: 'Cardiologist' },
  // Neurology
  { keywords: ['headache', 'migraine', 'seizure', 'numbness', 'dizziness', 'memory', 'nerve', 'paralysis', 'stroke', 'neck stiffness', 'vision change'], specialist: 'Neurologist' },
  // Dermatology
  { keywords: ['skin', 'rash', 'acne', 'itch', 'itching', 'eczema', 'psoriasis', 'hair loss', 'nail', 'hives', 'lesion'], specialist: 'Dermatologist' },
  // Orthopedics
  { keywords: ['bone', 'joint', 'knee', 'back pain', 'spine', 'fracture', 'muscle pain', 'shoulder', 'hip', 'ankle', 'wrist', 'arthritis', 'swollen joint'], specialist: 'Orthopedic' },
  // Pediatrics
  { keywords: ['child', 'baby', 'infant', 'toddler', 'kid', 'pediatric', 'my son', 'my daughter'], specialist: 'Pediatrician' },
  // Psychiatry
  { keywords: ['anxiety', 'depression', 'stress', 'mental', 'sleep disorder', 'panic', 'mood', 'psychiatric', 'suicidal', 'hallucination'], specialist: 'Psychiatrist' },
  // ENT
  { keywords: ['ear', 'nose', 'throat', 'sinus', 'tonsil', 'hearing', 'snoring', 'nasal', 'earache', 'runny nose'], specialist: 'ENT Specialist' },
  // Ophthalmology
  { keywords: ['eye', 'vision', 'blur', 'cataract', 'glaucoma', 'retina', 'sight', 'eye pain', 'red eye'], specialist: 'Ophthalmologist' },
  // Gastroenterology / General
  { keywords: ['stomach', 'abdomen', 'vomit', 'nausea', 'diarrhea', 'constipation', 'gastric', 'acidity', 'digestion', 'liver', 'bowel', 'bloating'], specialist: 'General Physician' },
  // General
  { keywords: ['fever', 'cold', 'cough', 'flu', 'fatigue', 'weakness', 'infection', 'diabetes', 'thyroid', 'weight', 'phlegm', 'sputum'], specialist: 'General Physician' },
];

const detectSpecialistFromSymptoms = (conversationText) => {
  const lower = conversationText.toLowerCase();
  for (const entry of symptomSpecialistMap) {
    const keywordMatch = entry.keywords.some(kw => lower.includes(kw));
    if (!keywordMatch) continue;
    // If entry has context requirement, both must match
    if (entry.context) {
      const contextMatch = entry.context.some(ctx => lower.includes(ctx));
      if (!contextMatch) continue;
    }
    return entry.specialist;
  }
  return null;
};

// Extract what has already been collected from conversation history
// Also merges any facts persisted by the client in sessionStorage
const extractCollectedInfo = (history, currentMessage, clientCollected = {}) => {
  const allText = [...history.map(h => h.content), currentMessage].join(' ').toLowerCase();
  const facts = { ...clientCollected }; // start with client-persisted facts

  // Symptom
  if (!facts.symptom) {
    const symptomPatterns = [
      { pattern: /stomach|abdomen|belly/, label: 'stomach/abdominal pain' },
      { pattern: /chest pain|chest/, label: 'chest pain' },
      { pattern: /headache|migraine/, label: 'headache' },
      { pattern: /cough/, label: 'cough' },
      { pattern: /fever/, label: 'fever' },
      { pattern: /nausea|vomit/, label: 'nausea/vomiting' },
      { pattern: /rash|skin|itch/, label: 'skin issue' },
      { pattern: /back pain|knee|joint|bone/, label: 'musculoskeletal pain' },
      { pattern: /anxiety|depression|stress|mental/, label: 'mental health concern' },
      { pattern: /ear|nose|throat|sinus/, label: 'ENT issue' },
      { pattern: /eye|vision|blur/, label: 'eye issue' },
      { pattern: /pain/, label: 'pain' },
    ];
    for (const { pattern, label } of symptomPatterns) {
      if (pattern.test(allText)) { facts.symptom = label; break; }
    }
  }

  // Location
  if (!facts.location) {
    const locMatch = allText.match(/in (my |the )?(stomach|abdomen|chest|back|knee|shoulder|head|neck|arm|leg|hip|ankle|wrist|eye|ear|throat)/);
    if (locMatch) facts.location = locMatch[2];
  }

  // Character — interpret typos charitably (shark → sharp)
  if (!facts.character) {
    if (/sharp|shark|stabbing/.test(allText)) facts.character = 'sharp/stabbing';
    else if (/dull|aching/.test(allText)) facts.character = 'dull/aching';
    else if (/squeezing|crushing|pressure/.test(allText)) facts.character = 'squeezing/pressure';
    else if (/cramping|cramp/.test(allText)) facts.character = 'cramping';
    else if (/burning|burn/.test(allText)) facts.character = 'burning';
    else if (/dry cough/.test(allText)) facts.character = 'dry cough';
    else if (/wet cough|phlegm|sputum/.test(allText)) facts.character = 'wet cough with phlegm';
  }

  // Duration
  if (!facts.duration) {
    const durationMatch = allText.match(/(\d+)\s*(day|days|week|weeks|hour|hours|month|months)/);
    if (durationMatch) facts.duration = durationMatch[0];
  }

  // Severity
  if (!facts.severity) {
    const severityMatch = allText.match(/\b([1-9]|10)\s*(out of|\/)\s*10/);
    if (severityMatch) facts.severity = severityMatch[0];
  }

  // Triggers
  if (!facts.trigger) {
    if (/related to eating|after eating|before eating/.test(allText)) facts.trigger = 'related to eating';
    else if (/motion sickness|motion/.test(allText)) facts.trigger = 'motion';
    else if (/stress/.test(allText)) facts.trigger = 'stress';
  }

  // Build display string for system prompt
  const lines = [];
  if (facts.symptom) lines.push(`Symptom: ${facts.symptom}`);
  if (facts.location) lines.push(`Location: ${facts.location}`);
  if (facts.character) lines.push(`Character: ${facts.character}`);
  if (facts.duration) lines.push(`Duration: ${facts.duration}`);
  if (facts.severity) lines.push(`Severity: ${facts.severity}`);
  if (facts.trigger) lines.push(`Trigger: ${facts.trigger}`);

  return {
    display: lines.length > 0 ? lines.join('\n') : 'Nothing collected yet — this is the start of the conversation.',
    facts  // return updated facts so backend can send them back to client
  };
};

exports.triageChat = async (req, res) => {
  try {
    const { message, history = [], language = 'english', collected: clientCollected = {} } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const languageInstructions = {
      english: 'Respond in English.',
      hindi: 'Respond in Hindi (Devanagari script). Use simple, conversational Hindi.',
      gujarati: 'Respond in Gujarati (Gujarati script). Use simple, conversational Gujarati.'
    };

    // Build a summary of what has already been collected from the conversation
    // Merge server-parsed facts with client-persisted storage facts
    const collectedInfo = extractCollectedInfo(history, message, clientCollected);

    const systemPrompt = `You are Dr. Aarogya, a senior medical triage officer. ${languageInstructions[language] || languageInstructions.english}

WHAT YOU ALREADY KNOW ABOUT THIS PATIENT:
${collectedInfo.display}

CLINICAL PROTOCOLS:
1. RED FLAGS FIRST: If the user mentions "chest pain," "difficulty breathing," "sudden weakness," "fainting," or "severe bleeding," immediately ask about associated emergency symptoms (e.g., cold sweats, loss of consciousness) before anything else.
2. CHARACTER OVER QUANTITY: Ask about the quality of symptoms, not just severity.
   - For PAIN: "Is it sharp, dull, or squeezing?" instead of just "rate 1-10"
   - For COUGH: "Is it dry or producing phlegm?"
   - For HEADACHE: Ask about vision changes or neck stiffness.
   - For STOMACH PAIN: Ask if it's related to eating or if there's a fever.
3. SMART QUESTION FLOW — collect in this order, SKIP anything already known:
   - PAIN: location → character (sharp/dull/squeezing) → duration → severity (1-10) → red flags
   - NAUSEA/VOMITING: duration → triggers (food/motion/stress) → severity
   - FEVER/COUGH: duration → character (dry/wet cough) → other symptoms
   - SKIN: location on body → duration → character (itchy/painful/spreading)
   - MENTAL: duration → impact on daily life → sleep quality
4. EMPATHY: Use warm transitions like "I understand. To help me guide you better..." or "That sounds quite uncomfortable."
5. STRICT RULES:
   - Ask ONLY ONE question per response — never combine two questions.
   - NEVER ask about something already listed in WHAT YOU ALREADY KNOW.
   - NEVER ask location for nausea/vomiting.
   - If the user's reply is unclear or a typo (e.g. "shark" instead of "sharp"), interpret it charitably and move forward.
   - Keep responses under 45 words.
   - NO medical advice or diagnosis. Only triage to a specialist.
   - Respond warmly to greetings, then ask about symptoms.

Once you have: symptom + character + duration → provide recommendation using [SPECIALIST:Name].

Valid Specialists: Cardiologist, Dermatologist, Neurologist, Orthopedic, Pediatrician, Psychiatrist, General Physician, ENT Specialist, Gynecologist, Ophthalmologist`;

    let aiResponse;

    // Build conversation history for Groq (most reliable for context)
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content })),
      { role: 'user', content: message }
    ];

    // Red flag emergency override — inject critical instruction before API call
    const isEmergency = redFlags.some(flag => message.toLowerCase().includes(flag));
    if (isEmergency) {
      messages.push({
        role: 'system',
        content: 'CRITICAL: The user has mentioned a potential emergency symptom. Focus exclusively on ruling out immediate life-threats (fainting, cold sweats, loss of consciousness) before suggesting a specialist.'
      });
    }

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
        completed: true,
        collected: collectedInfo.facts
      });
    }

    res.json({ message: cleanResponse, completed: false, collected: collectedInfo.facts });
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
