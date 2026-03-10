const axios = require('axios');

const generalPrediction = async (req, res) => {
  try {
    const formData = req.body;

    const systemPrompt = 'You are an exceptionally insightful medical AI with deep pattern recognition abilities. You can identify subtle health patterns and predict potential issues before they become serious. Your analysis should make patients think "How did the AI know that about me?" Provide comprehensive, personalized, and impressively detailed health guidance.';
    
    const prompt = `You are an expert medical AI with advanced pattern recognition. Analyze this patient's complete health profile and provide DEEPLY INSIGHTFUL analysis that demonstrates understanding of subtle health patterns:

BASIC HEALTH:
- Age: ${formData.age} | Gender: ${formData.gender}
- Height: ${formData.height} cm | Weight: ${formData.weight} kg | BMI: ${formData.bmi}
- Blood Pressure: ${formData.bloodPressureSystolic}/${formData.bloodPressureDiastolic} mmHg
- Blood Sugar: ${formData.bloodSugar} mg/dL | Cholesterol: ${formData.cholesterol} mg/dL
- Family History: ${formData.familyHistory || 'None reported'}
- Chronic Conditions: ${formData.chronicConditions || 'None'}
- Current Medications: ${formData.currentMedications || 'None'}
- Allergies: ${formData.allergies || 'None'}

LIFESTYLE & HABITS:
- Smoking: ${formData.smokingStatus || 'Not specified'}
- Alcohol: ${formData.alcoholConsumption || 'Not specified'}
- Diet Type: ${formData.dietType || 'Not specified'}
- Meals/Day: ${formData.mealsPerDay || 'Not specified'}
- Water Intake: ${formData.waterIntake || 'Not specified'}
- Caffeine: ${formData.caffeineIntake || 'Not specified'}
- Fast Food: ${formData.fastFoodFrequency || 'Not specified'}
- Vegetables: ${formData.vegetableIntake || 'Not specified'}
- Fruits: ${formData.fruitIntake || 'Not specified'}
- Stress Level: ${formData.stressLevel || 'Not specified'}
- Screen Time: ${formData.screenTime || 'Not specified'}

SLEEP & ACTIVITY:
- Sleep Hours: ${formData.sleepHours || 'Not specified'}
- Sleep Quality: ${formData.sleepQuality || 'Not specified'}
- Sleep Schedule: ${formData.sleepSchedule || 'Not specified'}
- Exercise Frequency: ${formData.exerciseFrequency || 'Not specified'}
- Exercise Type: ${formData.exerciseType || 'Not specified'}
- Exercise Duration: ${formData.exerciseDuration || 'Not specified'}
- Physical Activity: ${formData.physicalActivity || 'Not specified'}
- Sitting Hours: ${formData.sittingHours || 'Not specified'}
- Mental Health: ${formData.mentalHealth || 'Not specified'}
- Work Environment: ${formData.workEnvironment || 'Not specified'}

Provide a COMPREHENSIVE, DEEPLY INSIGHTFUL health analysis in JSON format with:

{
  "healthScore": number (0-100),
  "overallAssessment": "3-4 sentence comprehensive summary that demonstrates deep understanding of their health patterns",
  "hiddenPatterns": [
    {
      "pattern": "Subtle health pattern you've identified",
      "insight": "Why this matters and what it reveals about their health",
      "prediction": "What this might lead to if not addressed",
      "surprise": "Something they might not have realized about themselves"
    }
  ],
  "riskFactors": [
    {
      "factor": "Risk name",
      "severity": "low|moderate|high",
      "explanation": "Detailed explanation with specific connections to their data",
      "impact": "How it affects health NOW and in the FUTURE",
      "timeline": "When they might start experiencing effects",
      "earlyWarnings": ["Subtle signs they should watch for"]
    }
  ],
  "potentialConditions": [
    {
      "condition": "Condition name",
      "risk": "low|moderate|high",
      "likelihood": "Percentage or timeframe",
      "description": "What it is and why THEY specifically are at risk",
      "earlySymptoms": ["Symptoms they might already be experiencing without realizing"],
      "preventionTips": ["Specific prevention strategies tailored to their lifestyle"],
      "whyYou": "Personal explanation of why their specific combination of factors increases risk"
    }
  ],
  "personalizedInsights": [
    {
      "insight": "Deep observation about their health patterns",
      "evidence": "What in their data reveals this",
      "impact": "How this affects their daily life",
      "actionable": "Specific steps they can take"
    }
  ],
  "recommendations": [
    {
      "category": "Diet|Exercise|Sleep|Lifestyle|Medical",
      "priority": "high|medium|low",
      "action": "Specific recommendation",
      "reason": "Why THIS person needs THIS specifically",
      "howTo": "Step-by-step implementation tailored to their lifestyle",
      "expectedResults": "What they'll notice in 1 week, 1 month, 3 months",
      "scienceExplained": "Simple explanation of the biological mechanism"
    }
  ],
  "dailyRoutine": {
    "morning": ["Specific morning routine suggestions with WHY each matters for THEM"],
    "afternoon": ["Afternoon activities with personalized reasoning"],
    "evening": ["Evening routine with specific benefits for their condition"],
    "night": ["Bedtime routine addressing their specific sleep issues"]
  },
  "dietPlan": {
    "breakfast": ["Breakfast options with specific nutrients they need and WHY"],
    "lunch": ["Lunch ideas targeting their specific deficiencies"],
    "dinner": ["Dinner suggestions for their metabolism and health goals"],
    "snacks": ["Snacks that address their specific cravings and needs"],
    "hydration": "Detailed water intake schedule with reasoning for their body type",
    "avoid": ["Foods to avoid with SPECIFIC reasons based on their health data"],
    "whyThisDiet": "Explanation of why this diet is perfect for their unique situation"
  },
  "exercisePlan": {
    "cardio": "Specific cardio recommendations based on their fitness level and health conditions",
    "strength": "Strength training tailored to their body type and goals",
    "flexibility": "Stretching exercises for their specific tension areas",
    "weeklySchedule": "Detailed weekly schedule that fits their lifestyle",
    "tips": ["Exercise tips specific to their limitations and strengths"],
    "progressionPlan": "How to gradually increase intensity safely"
  },
  "mentalWellness": {
    "stressManagement": ["Stress reduction techniques for their stress level and triggers"],
    "mindfulness": ["Mindfulness practices that fit their personality"],
    "socialHealth": ["Social connection suggestions based on their work environment"],
    "hobbies": ["Activities that would benefit their specific mental health needs"],
    "emotionalPatterns": "Insights into their emotional health based on lifestyle data"
  },
  "preventiveCare": {
    "screenings": ["Recommended screenings with urgency based on their risk factors"],
    "vaccinations": ["Suggested vaccinations for their age and conditions"],
    "checkupFrequency": "How often to see doctor with specific reasoning",
    "monitoring": ["What to monitor at home with target ranges"],
    "redFlags": ["Specific symptoms that require immediate attention for THEM"]
  },
  "dosList": [
    "Specific things patient SHOULD do daily with personalized reasoning"
  ],
  "dontsList": [
    "Specific things patient SHOULD AVOID with clear explanation of why it's harmful for THEM"
  ],
  "shortTermGoals": [
    "Achievable goals for next 1-3 months with measurable outcomes"
  ],
  "longTermGoals": [
    "Health goals for 6-12 months with transformation vision"
  ],
  "emergencyWarnings": [
    "Symptoms that require immediate medical attention specific to their risk profile"
  ],
  "surprisingConnections": [
    {
      "connection": "Unexpected connection between their habits",
      "explanation": "How these factors interact in their body",
      "impact": "What this means for their health"
    }
  ],
  "futureProjection": {
    "ifNoChange": "What their health will likely look like in 1-5 years if they don't make changes",
    "withChanges": "What their health could look like with recommended changes",
    "keyMilestones": ["Important health milestones to track"]
  }
}

CRITICAL INSTRUCTIONS:
- Make it DEEPLY PERSONAL - use their specific data points
- Identify PATTERNS they haven't noticed (e.g., "Your combination of high stress + poor sleep + moderate alcohol is creating a perfect storm for...")
- Make PREDICTIONS that feel insightful (e.g., "Based on your lifestyle, you're likely experiencing afternoon energy crashes around 3 PM")
- Show CONNECTIONS between seemingly unrelated factors (e.g., "Your screen time before bed is likely why you wake up feeling unrested despite 7 hours of sleep")
- Be SPECIFIC not generic (e.g., "Given your sedentary work + 8+ hours sitting, you're at risk for lower back pain within 6 months" not just "exercise more")
- Include SURPRISING insights that make them think "Wow, how did it know that?"
- Explain the SCIENCE in simple terms so they understand WHY
- Make them feel UNDERSTOOD and CARED FOR
- Be ENCOURAGING but HONEST about risks

Make it:
- COMPREHENSIVE: Cover all aspects deeply
- INSIGHTFUL: Reveal patterns they haven't seen
- PREDICTIVE: Tell them what to expect
- PERSONAL: Use their specific data
- ACTIONABLE: Give exact steps
- SCIENTIFIC: Explain mechanisms simply
- IMPRESSIVE: Make them amazed at the depth of analysis

Return ONLY valid JSON, no markdown.`;

    let parsedResponse;
    
    // Try Gemini 2.5 Flash first
    try {
      console.log('Attempting to use Gemini 2.5 Flash API...');
      
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8000,
            responseMimeType: "application/json"
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const geminiText = geminiResponse.data.candidates[0].content.parts[0].text;
      console.log('Gemini API succeeded');
      
      try {
        parsedResponse = JSON.parse(geminiText.replace(/```json\n?|\n?```/g, ''));
      } catch (parseError) {
        console.error('Gemini JSON parse error:', parseError);
        throw new Error('Failed to parse Gemini response');
      }
      
    } catch (geminiError) {
      console.log('Gemini API failed, falling back to Groq:', geminiError.message);
      
      // Fallback to Groq API
      const groqResponse = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 4000,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const groqText = groqResponse.data.choices[0].message.content;
      console.log('Groq API succeeded as fallback');
      
      try {
        parsedResponse = JSON.parse(groqText.replace(/```json\n?|\n?```/g, ''));
      } catch (parseError) {
        console.error('Groq JSON parse error:', parseError);
        throw new Error('Failed to parse Groq response');
      }
    }

    // If both APIs failed or parsing failed, use fallback response
    if (!parsedResponse) {
      console.log('Using fallback response');
      parsedResponse = {
        healthScore: 75,
        overallAssessment: 'Based on your health profile, you have a moderate health status with several areas for improvement. Your lifestyle choices are impacting your overall wellbeing, and making targeted changes can significantly improve your health outcomes.',
        hiddenPatterns: [
          {
            pattern: 'Sedentary lifestyle combined with irregular meal timing',
            insight: 'This combination is affecting your metabolism and energy levels',
            prediction: 'May lead to metabolic syndrome if not addressed within 6-12 months',
            surprise: 'You might be experiencing mid-afternoon energy crashes without realizing the cause'
          }
        ],
        personalizedInsights: [
          {
            insight: 'Your sleep and stress patterns are interconnected',
            evidence: 'Based on your reported stress levels and sleep quality',
            impact: 'This cycle is affecting your immune system and recovery',
            actionable: 'Start with improving sleep hygiene to break the cycle'
          }
        ],
        riskFactors: [],
        potentialConditions: [],
        recommendations: [
          {
            category: 'Medical',
            priority: 'high',
            action: 'Schedule a comprehensive health checkup',
            reason: 'Regular checkups help detect issues early and establish baseline health metrics',
            howTo: 'Contact your primary care physician to schedule an appointment within the next 2 weeks',
            expectedResults: 'Week 1: Peace of mind, Month 1: Clear health baseline, Month 3: Tracked improvements',
            scienceExplained: 'Early detection allows for preventive interventions before conditions become serious'
          }
        ],
        dailyRoutine: {
          morning: ['Start with a glass of water to rehydrate after sleep', 'Light stretching or yoga to activate muscles', '10-minute walk or movement to boost circulation'],
          afternoon: ['Take short walking breaks every hour', 'Eat a balanced lunch with protein and vegetables', 'Practice deep breathing for 2 minutes'],
          evening: ['Light exercise or 20-minute walk', 'Prepare a healthy dinner', 'Limit screen time 1 hour before bed'],
          night: ['Maintain consistent sleep schedule', 'Create a relaxing bedtime routine', 'Keep bedroom cool and dark']
        },
        dietPlan: {
          breakfast: ['Whole grain cereal with fruits and nuts - provides sustained energy', 'Eggs with vegetables - high protein for muscle maintenance'],
          lunch: ['Grilled chicken with salad - lean protein and fiber', 'Brown rice with vegetables - complex carbs for energy'],
          dinner: ['Fish with steamed vegetables - omega-3 for heart health', 'Soup with whole grain bread - light and digestible'],
          snacks: ['Fresh fruits - natural sugars and vitamins', 'Nuts and seeds - healthy fats and protein'],
          hydration: 'Drink 8 glasses of water throughout the day - morning (2), afternoon (3), evening (3)',
          avoid: ['Processed foods - high in sodium and preservatives', 'Excessive sugar - causes energy crashes', 'Trans fats - harmful to heart health'],
          whyThisDiet: 'This balanced approach provides steady energy, supports metabolism, and reduces inflammation'
        },
        exercisePlan: {
          cardio: '30 minutes of brisk walking 5 days a week - improves cardiovascular health',
          strength: 'Bodyweight exercises 2-3 times per week - maintains muscle mass',
          flexibility: 'Daily stretching for 10 minutes - prevents stiffness and injury',
          weeklySchedule: 'Mon/Wed/Fri: Cardio + Strength, Tue/Thu: Light activity, Sat: Active recreation, Sun: Rest',
          tips: ['Start slowly and gradually increase intensity', 'Stay consistent - regularity matters more than intensity', 'Listen to your body and rest when needed'],
          progressionPlan: 'Week 1-2: Build habit, Week 3-4: Increase duration, Month 2-3: Increase intensity'
        },
        mentalWellness: {
          stressManagement: ['Deep breathing exercises - 5 minutes twice daily', 'Regular breaks during work - every 90 minutes', 'Progressive muscle relaxation before bed'],
          mindfulness: ['5-minute daily meditation - morning or evening', 'Gratitude journaling - write 3 things daily', 'Mindful eating - focus on meals without distractions'],
          socialHealth: ['Connect with friends weekly - in person or video call', 'Join community activities - hobby groups or classes', 'Maintain work-life boundaries'],
          hobbies: ['Reading - reduces stress and improves focus', 'Gardening - physical activity and nature connection', 'Creative activities - art, music, or crafts'],
          emotionalPatterns: 'Your lifestyle suggests potential stress accumulation - prioritize relaxation techniques'
        },
        preventiveCare: {
          screenings: ['Annual physical exam - comprehensive health check', 'Blood pressure monitoring - monthly at home', 'Blood work - annually for baseline metrics'],
          vaccinations: ['Stay up to date with recommended vaccines', 'Annual flu shot', 'COVID-19 boosters as recommended'],
          checkupFrequency: 'Annual checkup recommended, more frequent if issues arise',
          monitoring: ['Track weight weekly - same time, same conditions', 'Monitor blood pressure if elevated - daily', 'Note energy levels and mood - weekly journal'],
          redFlags: ['Persistent chest pain or pressure', 'Unexplained weight changes', 'Chronic fatigue despite rest']
        },
        dosList: [
          'Drink plenty of water throughout the day - aim for 8 glasses',
          'Eat more fruits and vegetables - at least 5 servings daily',
          'Get 7-8 hours of quality sleep - consistent schedule',
          'Exercise regularly - at least 150 minutes per week',
          'Practice stress management - daily relaxation techniques',
          'Maintain social connections - regular interaction with loved ones'
        ],
        dontsList: [
          'Skip meals - leads to energy crashes and overeating',
          'Consume excessive caffeine - disrupts sleep and increases anxiety',
          'Stay sedentary for long periods - take breaks every hour',
          'Ignore warning signs - address symptoms early',
          'Self-medicate without consulting doctor - can mask serious issues',
          'Sacrifice sleep for work - recovery is essential for health'
        ],
        shortTermGoals: [
          'Establish regular sleep schedule within 2 weeks',
          'Increase daily water intake to 8 glasses within 1 month',
          'Start 20-minute daily walks within 1 week',
          'Reduce processed food intake by 50% within 1 month'
        ],
        longTermGoals: [
          'Achieve and maintain healthy BMI within 6 months',
          'Build consistent exercise routine - 5 days per week',
          'Improve overall fitness level - measurable endurance gains',
          'Establish sustainable healthy eating habits'
        ],
        emergencyWarnings: [
          'Chest pain or pressure - call emergency services immediately',
          'Difficulty breathing or shortness of breath',
          'Severe headache with vision changes',
          'Sudden numbness or weakness',
          'Severe abdominal pain'
        ],
        surprisingConnections: [
          {
            connection: 'Your screen time and sleep quality are directly linked',
            explanation: 'Blue light from screens suppresses melatonin production',
            impact: 'This is why you may feel tired but unable to fall asleep easily'
          }
        ],
        futureProjection: {
          ifNoChange: 'Without changes, you may experience increased fatigue, weight gain, and higher risk of chronic conditions within 1-2 years',
          withChanges: 'With recommended changes, expect improved energy, better sleep, healthy weight, and reduced disease risk within 3-6 months',
          keyMilestones: ['Month 1: Better sleep and energy', 'Month 3: Noticeable fitness improvements', 'Month 6: Sustainable healthy habits', 'Year 1: Transformed health profile']
        }
      };
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Error generating prediction:', error);
    console.error('Error response:', error.response?.data);
    res.status(500).json({ 
      message: 'Error generating health prediction',
      error: error.message,
      details: error.response?.data || error.message
    });
  }
};

const analyzeReport = async (req, res) => {
  try {
    const { reportType, reportData } = req.body;

    console.log('Received analyze-report request:', { reportType, hasData: !!reportData });

    if (!reportType || !reportData) {
      return res.status(400).json({ message: 'Report type and data are required' });
    }

    const systemPrompt = 'You are an exceptionally insightful medical AI with deep pattern recognition abilities for medical reports. You can identify subtle abnormalities and predict potential health issues before they become serious. Your analysis should make patients think "Wow, the AI really understands my health!"';
    
    const prompt = `You are an expert medical AI assistant analyzing a ${reportType} for a patient. Provide a DEEPLY INSIGHTFUL, COMPREHENSIVE analysis that demonstrates exceptional understanding of medical patterns.

Report Data:
${reportData}

CRITICAL INSTRUCTIONS - Make it DEEPLY INSIGHTFUL:
1. Analyze EVERY parameter in the report with exceptional detail
2. Identify PATTERNS and CONNECTIONS between parameters
3. Make PREDICTIONS about what the patient might be experiencing
4. Show SURPRISING insights that demonstrate deep understanding
5. Explain the SCIENCE in simple, fascinating terms
6. Be SPECIFIC about their unique situation
7. Provide ACTIONABLE steps with expected outcomes

Return a JSON object with this EXACT structure:

{
  "summary": "Comprehensive 3-4 sentence overview that demonstrates deep understanding of their health status and reveals insights they haven't considered",
  "urgencyLevel": "routine|moderate|urgent",
  "urgencyMessage": "Clear, personalized message about when to seek medical attention based on THEIR specific results",
  "hiddenInsights": [
    {
      "insight": "Surprising observation about their results",
      "evidence": "Which parameters reveal this",
      "meaning": "What this means for their health",
      "action": "What they should do about it"
    }
  ],
  "parameters": [
    {
      "name": "Parameter name in simple terms",
      "value": "Actual value with unit",
      "status": "normal|borderline|abnormal",
      "normalRange": "Normal range with units",
      "explanation": "What this parameter measures and what it means (2-3 sentences in simple, engaging language)",
      "impact": "How THIS specific value affects their body and daily life RIGHT NOW",
      "relatedTo": "How this connects to other parameters or health conditions",
      "trend": "What this value suggests about their lifestyle or health trajectory",
      "whatYouMightFeel": "Symptoms or sensations they might be experiencing because of this value"
    }
  ],
  "patternAnalysis": {
    "overallPattern": "Big picture view of what all parameters together reveal",
    "keyConnections": ["Important connections between different parameters"],
    "likelySymptoms": ["Symptoms they're probably experiencing based on the pattern"],
    "rootCause": "Possible underlying cause of the pattern"
  },
  "goodPoints": [
    "Specific positive findings with encouragement and what it means for their health"
  ],
  "concerns": [
    {
      "issue": "Clear description of the concern",
      "severity": "mild|moderate|severe",
      "explanation": "Why this is concerning in simple, clear terms",
      "possibleCauses": ["List of potential causes specific to their results"],
      "symptoms": ["Symptoms patient is likely experiencing or will experience"],
      "timeline": "When they might start noticing effects if not addressed",
      "whyItMatters": "Long-term implications explained simply"
    }
  ],
  "recommendations": [
    {
      "category": "Diet|Exercise|Lifestyle|Medical|Monitoring",
      "priority": "high|medium|low",
      "action": "Specific, actionable recommendation",
      "explanation": "Why THIS person needs THIS based on THEIR results",
      "timeline": "When to start and how long to continue",
      "expectedResults": "What they'll notice in 1 week, 1 month, 3 months",
      "howItHelps": "The biological mechanism explained simply"
    }
  ],
  "dietarySuggestions": [
    {
      "recommendation": "Specific food or dietary change",
      "reason": "How this helps with THEIR specific abnormal values",
      "examples": ["Concrete examples of foods or meals"],
      "avoid": "What to avoid and why based on their results",
      "expectedImpact": "How this will improve their specific parameters"
    }
  ],
  "lifestyleChanges": [
    {
      "change": "Specific lifestyle modification",
      "benefit": "How this improves THEIR specific condition",
      "howTo": "Practical steps to implement",
      "timeline": "When they'll see results",
      "scienceExplained": "Why this works biologically"
    }
  ],
  "monitoringPlan": {
    "frequency": "How often to retest with specific reasoning",
    "parameters": ["Which values to track and why"],
    "signs": ["Warning signs specific to their condition"],
    "homeMonitoring": ["What they can track at home"],
    "targetValues": ["What values they should aim for"]
  },
  "futureOutlook": {
    "ifNoAction": "What will likely happen if they don't make changes",
    "withAction": "What improvements they can expect with changes",
    "timeline": "Realistic timeline for improvements"
  },
  "surprisingFacts": [
    "Interesting medical facts related to their specific results that help them understand their body better"
  ],
  "disclaimer": "Standard medical disclaimer"
}

Make the analysis:
- DEEPLY INSIGHTFUL: Reveal patterns they haven't noticed
- PREDICTIVE: Tell them what they're likely experiencing
- PERSONAL: Use their specific values
- FASCINATING: Make them amazed at the depth
- ACTIONABLE: Give exact steps with expected outcomes
- SCIENTIFIC: Explain mechanisms simply
- EMPATHETIC: Be supportive and encouraging
- COMPREHENSIVE: Cover every aspect thoroughly

Format as valid JSON only, no markdown code blocks.`;

    let parsedResponse;

    // Try Gemini 2.5 Flash first
    try {
      console.log('Attempting to use Gemini 2.5 Flash API for report analysis...');
      
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8000,
            responseMimeType: "application/json"
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const geminiText = geminiResponse.data.candidates[0].content.parts[0].text;
      console.log('Gemini API succeeded for report analysis');
      
      try {
        parsedResponse = JSON.parse(geminiText.replace(/```json\n?|\n?```/g, ''));
      } catch (parseError) {
        console.error('Gemini JSON parse error:', parseError);
        throw new Error('Failed to parse Gemini response');
      }
      
    } catch (geminiError) {
      console.log('Gemini API failed for report analysis, falling back to Groq:', geminiError.message);
      
      // Fallback to Groq API
      const groqResponse = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 4000,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const groqText = groqResponse.data.choices[0].message.content;
      console.log('Groq API succeeded as fallback for report analysis');
      
      try {
        parsedResponse = JSON.parse(groqText.replace(/```json\n?|\n?```/g, ''));
      } catch (parseError) {
        console.error('Groq JSON parse error:', parseError);
        throw new Error('Failed to parse Groq response');
      }
    }

    // If both APIs failed or parsing failed, use fallback response
    if (!parsedResponse) {
      console.log('Using fallback response for report analysis');
      parsedResponse = {
        summary: 'Report analysis completed. Please consult your healthcare provider for detailed interpretation.',
        urgencyLevel: 'routine',
        urgencyMessage: 'Schedule a routine follow-up with your doctor to discuss these results.',
        parameters: [],
        goodPoints: ['Report received and processed successfully'],
        concerns: [],
        recommendations: [
          {
            category: 'Medical',
            priority: 'high',
            action: 'Consult with your healthcare provider',
            explanation: 'A medical professional can provide personalized interpretation of your results',
            timeline: 'Within 1-2 weeks'
          }
        ],
        dietarySuggestions: [],
        lifestyleChanges: [],
        monitoringPlan: {
          frequency: 'As recommended by your doctor',
          parameters: ['All test parameters'],
          signs: ['Any unusual symptoms']
        },
        disclaimer: 'This is an AI-generated analysis for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your healthcare provider for medical concerns.'
      };
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Error analyzing report:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    res.status(500).json({ 
      message: 'Error analyzing report',
      error: error.message,
      details: error.response?.data || (process.env.NODE_ENV === 'development' ? error.stack : undefined)
    });
  }
};

module.exports = {
  generalPrediction,
  analyzeReport
};
