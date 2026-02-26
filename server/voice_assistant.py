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
    language = data.get('language', 'english')
    
    system_prompt = """You are an AI medical triage assistant. Ask ONE question at a time about symptoms.
After 3-4 exchanges, determine the medical specialization needed (e.g., Cardiologist, Dermatologist).
Keep responses brief and conversational for voice interaction."""
    
    try:
        chat = model.start_chat(history=[
            {'role': 'user', 'parts': [system_prompt]},
            {'role': 'model', 'parts': ['Understood. I will help with medical triage.']}
        ] + history)
        
        response = chat.send_message(message)
        ai_message = response.text
        
        # Check if diagnosis is complete
        specializations = ['cardiologist', 'dermatologist', 'neurologist', 'orthopedic', 
                          'pediatrician', 'psychiatrist', 'general physician']
        completed = any(spec in ai_message.lower() for spec in specializations)
        
        return jsonify({
            'message': ai_message,
            'completed': completed,
            'success': True
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
