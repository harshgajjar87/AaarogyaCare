import React, { useState, useRef, useEffect } from 'react';
import axios from '../utils/axios';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const AIVoiceCall = ({ isOpen, onClose }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState([]);
  const [callLog, setCallLog] = useState([]);
  const [language, setLanguage] = useState('english');
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        if (isSpeakingRef.current) return;
        
        let finalText = '';
        let interimText = '';
        
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript;
          } else {
            interimText += result[0].transcript;
          }
        }
        
        if (finalText) {
          console.log('Final transcript:', finalText);
          finalTranscriptRef.current = finalText;
          setTranscript(finalText);
        } else if (interimText) {
          console.log('Interim transcript:', interimText);
          setTranscript(interimText);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Recognition ended');
        console.log('Final transcript ref:', finalTranscriptRef.current);
        console.log('Is recording:', isRecording);
        
        const finalText = finalTranscriptRef.current.trim();
        if (finalText) {
          console.log('Processing transcript:', finalText);
          handleVoiceInput(finalText);
          finalTranscriptRef.current = '';
          setTranscript('');
        } else {
          console.log('No transcript to process');
        }
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        // If network error, try to process what we have
        if (event.error === 'network' && finalTranscriptRef.current.trim()) {
          console.log('Network error, processing partial:', finalTranscriptRef.current);
          handleVoiceInput(finalTranscriptRef.current.trim());
          finalTranscriptRef.current = '';
          setTranscript('');
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const speak = (text) => {
    return new Promise((resolve) => {
      console.log('Speak function called with:', text);
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('Recognition stopped before speaking');
        } catch (e) {}
      }
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      
      // Small delay to ensure recognition is fully stopped
      setTimeout(() => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
          };
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        const langMap = { english: 'en-IN', hindi: 'hi-IN', gujarati: 'gu-IN' };
        utterance.lang = langMap[language] || 'en-IN';
        
        utterance.voice = voices.find(v => v.lang === utterance.lang) || 
                          voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0])) || null;
        
        console.log('Selected voice:', utterance.voice?.name || 'default');
        
        utterance.onstart = () => {
          console.log('Speech started');
        };
        
        utterance.onend = () => {
          console.log('Speech ended');
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          resolve();
        };
        
        utterance.onerror = (e) => {
          console.error('Speech error:', e);
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          resolve();
        };
        
        window.speechSynthesis.speak(utterance);
        console.log('Speech synthesis started');
      }, 200);
    });
  };

  const startCall = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsCallActive(true);
      const greetings = {
        english: "Hello, I'm your A.I. doctor. Press and hold the microphone button to speak.",
        hindi: "नमस्ते, मैं आपका A.I. डॉक्टर हूं। बोलने के लिए माइक्रोफोन बटन दबाएं और दबाए रखें।",
        gujarati: "નમસ્તે, હું તમારો A.I.ડોક્ટર છું. બોલવા માટે માઇક્રોફોન બટન દબાવો અને દબાવી રાખો."
      };
      const greeting = greetings[language];
      setCallLog([{ text: greeting, sender: 'ai' }]);
      speak(greeting);
    } catch (error) {
      alert('Microphone access is required for voice calls. Please allow microphone permission.');
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsSpeaking(false);
    onClose();
  };

  const startRecording = () => {
    if (isSpeaking || !recognitionRef.current || isRecording) return;
    
    finalTranscriptRef.current = '';
    setTranscript('');
    setIsRecording(true);
    
    const langMap = { english: 'en-IN', hindi: 'hi-IN', gujarati: 'gu-IN' };
    recognitionRef.current.lang = langMap[language] || 'en-IN';
    
    try {
      recognitionRef.current.start();
      console.log('Recording started');
    } catch (e) {
      console.log('Start failed:', e.message);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!isRecording || !recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      console.log('Recording stopped');
    } catch (e) {
      console.log('Stop failed:', e.message);
    }
  };

  const handleVoiceInput = async (text) => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    
    setCallLog(prev => [...prev, { text, sender: 'user' }]);

    try {
      console.log('Sending to AI:', text);
      const res = await axios.post('/triage/chat', { 
        message: text, 
        history: history.map(h => ({ role: h.role, content: h.content })),
        language
      });

      console.log('AI Response:', res.data);
      setCallLog(prev => [...prev, { text: res.data.message, sender: 'ai' }]);
      setHistory(prev => [
        ...prev,
        { role: 'user', content: text },
        { role: 'model', content: res.data.message }
      ]);

      console.log('Starting to speak:', res.data.message);
      await speak(res.data.message);
      console.log('Finished speaking');

      if (res.data.completed) {
        setTimeout(async () => {
          const finalMsg = "You can now book an appointment from the dashboard.";
          setCallLog(prev => [...prev, { text: finalMsg, sender: 'ai' }]);
          await speak(finalMsg);
          setTimeout(endCall, 5000);
        }, 2000);
      }
    } catch (error) {
      console.error('Voice input error:', error);
      const errorMsg = "I'm having trouble connecting. Please try again.";
      setCallLog(prev => [...prev, { text: errorMsg, sender: 'ai' }]);
      await speak(errorMsg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl shadow-2xl w-full max-w-md p-8 text-white">
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            <Phone size={64} className={isCallActive ? 'animate-pulse' : ''} />
          </div>
          <h2 className="text-2xl font-bold mb-2">AI Voice Doctor</h2>
          <p className="text-teal-100 text-sm mb-4">
            {isCallActive ? (isSpeaking ? 'AI is speaking...' : isRecording ? 'Listening...' : 'Press mic to speak') : 'Ready to start'}
          </p>
          {!isCallActive && (
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white bg-opacity-20 text-white text-sm px-4 py-2 rounded-full border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="english" className="text-slate-800">English</option>
              <option value="hindi" className="text-slate-800">हिंदी</option>
              <option value="gujarati" className="text-slate-800">ગુજરાતી</option>
            </select>
          )}
        </div>

        {isCallActive && (
          <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto">
            {callLog.map((log, idx) => (
              <p key={idx} className={`text-sm mb-2 ${log.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <span className="font-semibold">{log.sender === 'user' ? 'You' : 'AI'}:</span> {log.text}
              </p>
            ))}
            {transcript && (
              <p className="text-sm text-right text-teal-200 italic">
                {transcript}...
              </p>
            )}
          </div>
        )}

        <div className="flex justify-center gap-4 mb-6">
          {isCallActive && (
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isSpeaking}
              className={`p-6 rounded-full transition-all shadow-lg ${
                isRecording 
                  ? 'bg-red-500 scale-110' 
                  : isSpeaking 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30'
              }`}
            >
              <Mic size={32} />
            </button>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {!isCallActive ? (
            <button
              onClick={startCall}
              className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-full flex items-center gap-2 font-semibold transition-all shadow-lg"
            >
              <Phone size={24} />
              Start Call
            </button>
          ) : (
            <button
              onClick={endCall}
              className="bg-red-500 hover:bg-red-600 px-8 py-4 rounded-full flex items-center gap-2 font-semibold transition-all shadow-lg"
            >
              <PhoneOff size={24} />
              End Call
            </button>
          )}
        </div>

        {!isCallActive && (
          <button
            onClick={onClose}
            className="w-full mt-4 text-teal-100 hover:text-white text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default AIVoiceCall;
