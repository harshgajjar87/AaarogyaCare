import os
import asyncio
import edge_tts
import google.generativeai as genai
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import tempfile

app = Flask(__name__)
CORS(app)

genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

VOICES = {
    'english': 'en-IN-NeerjaNeural',
    'hindi': 'hi-IN-SwaraNeural',
    'gujarati': 'gu-IN-DhwaniNeural'
}

async def generate_audio(text, voice, filename):
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(filename)

@app.route('/voice/speak', methods=['POST'])
def speak():
    data = request.json
    text = data.get('text', '')
    language = data.get('language', 'english')
    voice = VOICES.get(language, VOICES['english'])
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
    
    try:
        asyncio.run(generate_audio(text, voice, temp_file.name))
        return send_file(temp_file.name, mimetype='audio/mpeg')
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/voice/chat', methods=['POST'])
def voice_chat():
    """Process voice conversation with Gemini"""
    data = request.json
    message = data.get('message', '')
    history = data.get('history', [])
    language = data.get('language', 'English')
    
    # Greetings in different languages
    greetings = {
        'English': "Hello! I'm Dr. Aarogya. How can I help you today?",
        'Hindi': "नमस्ते! मैं डॉ. आरोग्य हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
        'Gujarati': "નમસ્તે! હું ડૉ. આરોગ્ય છું। આજે હું તમને કેવી રીતે મદદ કરી શકું?"
    }
    
    # Enhanced system prompt for natural conversation
    system_prompt = f"""You are Dr. Aarogya, a warm and empathetic AI medical assistant conducting a voice consultation.

CRITICAL RULES:
1. Ask ONLY ONE question per response (maximum 15 words)
2. NEVER repeat the same question twice
3. Progress through the conversation naturally
4. Keep responses SHORT and conversational for voice/text chat

Communication Style:
- Be warm, empathetic, and conversational like a real doctor and real human being
- Speak naturally as if having a real conversation
- Show genuine concern: "I understand", "I see", "That must be concerning", "Ohh", "Ahhh", "Got it"
- Acknowledge what the patient says before asking the next question
- Use varied questions - don't repeat yourself

Question Flow (ask in this order, ONE at a time):
1. First response: "{greetings[language]}"
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
- If user asks non-medical questions, still answer briefly (2-3 sentences)
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
- Progress through the flow systematically"""
    
    try:
        # Convert history to Gemini format with better filtering
        gemini_history = []
        
        # Add system prompt
        gemini_history.append({'role': 'user', 'parts': [system_prompt]})
        gemini_history.append({'role': 'model', 'parts': ['Understood. I am Dr. Aarogya. I will maintain full context, never repeat questions, handle greetings naturally, and conduct a thoughtful medical consultation.']})
        
        # Track what information we've already gathered
        info_gathered = {
            'complaint': False,
            'location': False,
            'duration': False,
            'severity': False
        }
        
        # Add conversation history (ALL messages for full context)
        for i, msg in enumerate(history):
            if msg['role'] == 'user':
                gemini_history.append({'role': 'user', 'parts': [msg['content']]})
                # Track what info has been provided
                content_lower = msg['content'].lower()
                if any(word in content_lower for word in ['pain', 'hurt', 'ache', 'problem', 'issue', 'feel', 'sick']):
                    info_gathered['complaint'] = True
                if any(word in content_lower for word in ['below', 'above', 'near', 'navel', 'chest', 'head', 'stomach', 'left', 'right', 'side']):
                    info_gathered['location'] = True
                if any(word in content_lower for word in ['day', 'week', 'month', 'hour', 'since', 'yesterday', 'today', 'morning', 'night']):
                    info_gathered['duration'] = True
                if any(word in content_lower for word in ['severe', 'mild', 'moderate', 'much', 'little', 'worse', 'better', 'scale', 'rating']):
                    info_gathered['severity'] = True
                    
            elif msg['role'] == 'assistant':
                gemini_history.append({'role': 'model', 'parts': [msg['content']]})
        
        # Add context about what's been gathered
        context_note = "\n\nCONTEXT REMINDER - Information already provided by patient:\n"
        if info_gathered['complaint']:
            context_note += "✓ Main complaint described\n"
        if info_gathered['location']:
            context_note += "✓ Location specified\n"
        if info_gathered['duration']:
            context_note += "✓ Duration mentioned\n"
        if info_gathered['severity']:
            context_note += "✓ Severity/triggers discussed\n"
        context_note += "\nDO NOT ask about information already provided. Move to the next step."
        
        # Start chat with full history
        chat = model.start_chat(history=gemini_history)
        
        # Send current message with context reminder
        response = chat.send_message(message + context_note)
        ai_message = response.text
        
        # Check if diagnosis is complete
        specializations = ['cardiologist', 'dermatologist', 'neurologist', 'orthopedic', 
                          'pediatrician', 'psychiatrist', 'general physician', 'gastroenterologist',
                          'urologist', 'ent specialist', 'ophthalmologist', 'surgeon', 'gynecologist']
        completed = any(spec in ai_message.lower() for spec in specializations)
        
        return jsonify({
            'reply': ai_message,
            'completed': completed,
            'success': True
        })
    except Exception as e:
        print(f"Error in voice_chat: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'success': False}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
