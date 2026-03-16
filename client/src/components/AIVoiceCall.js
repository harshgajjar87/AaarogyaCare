import React, { useState, useRef, useEffect } from 'react';
import axios from '../utils/axios';
import { Phone, PhoneOff, Mic } from 'lucide-react';

const AIVoiceCall = ({ isOpen, onClose }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState([]);
  const [callLog, setCallLog] = useState([]);
  const [language, setLanguage] = useState('english');
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);

  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isCallActiveRef = useRef(false);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const indianVoices = voices.filter(v =>
        v.lang.includes('en-IN') ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('rishi') ||
        v.name.toLowerCase().includes('neel')
      );
      const englishVoices = indianVoices.length > 0 ? indianVoices : voices.filter(v => v.lang.startsWith('en'));
      setAvailableVoices(englishVoices);
      if (englishVoices.length > 0 && !selectedVoice) setSelectedVoice(englishVoices[0]);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    setTimeout(loadVoices, 100);

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        if (isSpeakingRef.current) return;
        let finalText = '';
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) finalText += result[0].transcript;
          else interimText += result[0].transcript;
        }
        if (finalText) { setTranscript(''); handleVoiceInput(finalText.trim()); }
        else if (interimText) setTranscript(interimText);
      };

      recognitionRef.current.onend = () => setIsRecording(false);
      recognitionRef.current.onerror = () => setIsRecording(false);
    }

    return () => { recognitionRef.current?.stop(); };
  }, []);

  const speak = (text) => new Promise((resolve) => {
    window.speechSynthesis.cancel();
    try { recognitionRef.current?.stop(); recognitionRef.current?.abort(); } catch (e) {}
    setIsSpeaking(true);
    isSpeakingRef.current = true;
    setIsRecording(false);

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap = { english: 'en-IN', hindi: 'hi-IN', gujarati: 'gu-IN' };
      utterance.lang = langMap[language] || 'en-IN';

      const voices = window.speechSynthesis.getVoices();
      utterance.voice = selectedVoice ||
        voices.find(v => v.lang === utterance.lang) ||
        voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0])) || null;

      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => { setIsSpeaking(false); isSpeakingRef.current = false; resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); isSpeakingRef.current = false; resolve(); };

      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);

      const keepAlive = setInterval(() => {
        if (window.speechSynthesis.speaking) { window.speechSynthesis.pause(); window.speechSynthesis.resume(); }
        else clearInterval(keepAlive);
      }, 5000);

      setTimeout(() => window.speechSynthesis.resume(), 100);
    }, 300);
  });

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      stream.getTracks().forEach(t => t.stop());

      setIsCallActive(true);
      isCallActiveRef.current = true;
      sessionStorage.removeItem('triage_collected');

      const greetings = {
        english: "Hello! I'm here to help you. Press and hold the mic button to speak.",
        hindi: "नमस्ते! मैं आपकी मदद के लिए यहां हूं। बोलने के लिए माइक बटन दबाए रखें।",
        gujarati: "નમસ્તે! હું તમને મદદ કરવા માટે અહીં છું. બોલવા માટે માઇક બટન દબાવી રાખો."
      };

      const greeting = greetings[language];
      setCallLog([{ text: greeting, sender: 'ai' }]);
      setHistory([{ role: 'assistant', content: greeting }]);
      await speak(greeting);
    } catch {
      alert('Microphone access is required. Please allow microphone permission.');
    }
  };

  const startRecording = () => {
    if (!isCallActive || isSpeaking || !recognitionRef.current) return;
    const langMap = { english: 'en-IN', hindi: 'hi-IN', gujarati: 'gu-IN' };
    recognitionRef.current.lang = langMap[language] || 'en-IN';
    setTimeout(() => {
      try { recognitionRef.current.start(); setIsRecording(true); }
      catch (e) {
        if (e.name !== 'InvalidStateError') {
          setTimeout(() => {
            try { recognitionRef.current.start(); setIsRecording(true); } catch {}
          }, 300);
        }
      }
    }, 100);
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try { recognitionRef.current.stop(); } catch {}
    }
  };

  const endCall = () => {
    isCallActiveRef.current = false;
    window.speechSynthesis.cancel();
    try { recognitionRef.current?.stop(); recognitionRef.current?.abort(); } catch {}
    setIsCallActive(false);
    setIsRecording(false);
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setTranscript('');
    setCallLog([]);
    setHistory([]);
    onClose();
  };

  const handleVoiceInput = async (text) => {
    if (!text || text.trim().length < 2) return;
    try { recognitionRef.current?.stop(); setIsRecording(false); } catch {}
    setCallLog(prev => [...prev, { text, sender: 'user' }]);

    try {
      const collected = JSON.parse(sessionStorage.getItem('triage_collected') || '{}');
      const res = await axios.post('/triage/chat', { message: text, history, language, collected });

      if (res.data.collected) {
        sessionStorage.setItem('triage_collected', JSON.stringify({ ...collected, ...res.data.collected }));
      }

      const aiMessage = res.data.message;
      setCallLog(prev => [...prev, { text: aiMessage, sender: 'ai' }]);
      setHistory(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: aiMessage }]);
      await speak(aiMessage);

      if (res.data.completed || res.data.specialization) {
        setTimeout(async () => {
          const finalMsg = language === 'hindi'
            ? "आप अब डैशबोर्ड से अपॉइंटमेंट बुक कर सकते हैं।"
            : language === 'gujarati'
            ? "તમે હવે ડેશબોર્ડમાંથી એપોઇન્ટમેન્ટ બુક કરી શકો છો."
            : "You can now book an appointment from the dashboard.";
          setCallLog(prev => [...prev, { text: finalMsg, sender: 'ai' }]);
          await speak(finalMsg);
          setTimeout(endCall, 3000);
        }, 1000);
      }
    } catch {
      const errorMsg = language === 'hindi'
        ? "मुझे कनेक्ट करने में परेशानी हो रही है।"
        : language === 'gujarati'
        ? "મને કનેક્ટ કરવામાં મુશ્કેલી આવી રહી છે."
        : "I'm having trouble connecting. Please try again.";
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
            {isCallActive
              ? isSpeaking ? 'AI is speaking...'
              : isRecording ? 'Listening...'
              : 'Press & hold mic to speak'
              : 'Ready to start'}
          </p>

          {!isCallActive && (
            <div className="space-y-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-white bg-opacity-20 text-white text-sm px-4 py-2 rounded-full border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="english" className="text-slate-800">English</option>
                <option value="hindi" className="text-slate-800">हिंदी</option>
                <option value="gujarati" className="text-slate-800">ગુજરાતી</option>
              </select>

              {availableVoices.length > 0 && (
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => setSelectedVoice(availableVoices.find(v => v.name === e.target.value))}
                  className="w-full bg-white bg-opacity-20 text-white text-sm px-4 py-2 rounded-full border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="" className="text-slate-800">Select Voice Accent</option>
                  {availableVoices.map(v => (
                    <option key={v.name} value={v.name} className="text-slate-800">{v.name} ({v.lang})</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {isCallActive && (
          <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto">
            {callLog.map((log, idx) => (
              <p key={idx} className={`text-sm mb-2 ${log.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <span className="font-semibold">{log.sender === 'user' ? 'You' : 'AI'}:</span> {log.text}
              </p>
            ))}
            {transcript && <p className="text-sm text-right text-teal-200 italic">{transcript}...</p>}
          </div>
        )}

        {/* Push-to-talk mic button */}
        {isCallActive && (
          <div className="flex justify-center mb-6">
            <div className="text-center">
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                onTouchEnd={stopRecording}
                disabled={isSpeaking}
                className={`p-6 rounded-full transition-all shadow-lg select-none ${
                  isRecording
                    ? 'bg-red-500 animate-pulse scale-110'
                    : isSpeaking
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 active:scale-95'
                }`}
              >
                <Mic size={32} />
              </button>
              <p className="text-sm mt-2">
                {isSpeaking ? 'AI Speaking...' : isRecording ? 'Listening...' : 'Press & Hold to Speak'}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4">
          {!isCallActive ? (
            <button
              onClick={startCall}
              className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-full flex items-center gap-2 font-semibold transition-all shadow-lg"
            >
              <Phone size={24} /> Start Call
            </button>
          ) : (
            <button
              onClick={endCall}
              className="bg-red-500 hover:bg-red-600 px-8 py-4 rounded-full flex items-center gap-2 font-semibold transition-all shadow-lg"
            >
              <PhoneOff size={24} /> End Call
            </button>
          )}
        </div>

        {!isCallActive && (
          <button onClick={onClose} className="w-full mt-4 text-teal-100 hover:text-white text-sm">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default AIVoiceCall;
