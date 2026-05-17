import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from '../utils/axios';
import { Stethoscope, X, Send, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const STORAGE_KEY = 'triage_collected';

const langCodeMap = {
  english: 'en-US',
  hindi: 'hi-IN',
  gujarati: 'gu-IN',
};

const greetings = {
  english: "Hello! I'm your AI triage assistant. Please describe your symptoms, and I'll help find the right specialist for you.",
  hindi: "नमस्ते! मैं आपका AI ट्राइएज सहायक हूँ। कृपया अपने लक्षण बताएं, मैं सही विशेषज्ञ खोजने में मदद करूँगा।",
  gujarati: "નમસ્તે! હું તમારો AI ટ્રાઇએજ સહાયક છું. કૃપા કરીને તમારા લક્ષણો જણાવો, હું યોગ્ય નિષ્ણાત શોધવામાં મદદ કરીશ.",
};

const recommendText = {
  english: (s) => `I recommend seeing a ${s}. Here are available doctors:`,
  hindi: (s) => `मैं ${s} से मिलने की सलाह देता हूँ। यहाँ उपलब्ध डॉक्टर हैं:`,
  gujarati: (s) => `હું ${s} ને મળવાની ભલામણ કરું છું. અહીં ઉપલબ્ધ ડૉક્ટર છે:`,
};

const AITriageChat = ({ isOpen, onClose }) => {
  const [language, setLanguage] = useState('english');
  const [messages, setMessages] = useState([
    { text: greetings['english'], sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [completed, setCompleted] = useState(false);

  // Speech-to-text state
  const [isListening, setIsListening] = useState(false);
  // TTS state — tracks which message index is currently being spoken
  const [speakingIdx, setSpeakingIdx] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Clear storage when chat opens fresh
  useEffect(() => {
    if (isOpen) sessionStorage.removeItem(STORAGE_KEY);
  }, [isOpen]);

  // Update greeting when language changes (only if conversation hasn't started)
  useEffect(() => {
    setMessages([{ text: greetings[language], sender: 'ai' }]);
    setHistory([]);
    setCompleted(false);
    sessionStorage.removeItem(STORAGE_KEY);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Speech Recognition setup ──────────────────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, []);

  // Update recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = langCodeMap[language] || 'en-US';
    }
  }, [language]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return alert('Speech recognition not supported in this browser. Use Chrome or Edge.');

    if (isListening) {
      recognition.stop();
    } else {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      recognition.lang = langCodeMap[language] || 'en-US';
      recognition.start();
      setIsListening(true);
    }
  };

  // ── Text-to-Speech ────────────────────────────────────────────────────────
  const speakMessage = useCallback((text, idx) => {
    if (!window.speechSynthesis) return;

    // If already speaking this message, stop it
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCodeMap[language] || 'en-US';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang === utterance.lang) ||
                  voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0]));
    if (match) utterance.voice = match;

    utterance.onstart = () => setSpeakingIdx(idx);
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);

    window.speechSynthesis.speak(utterance);
  }, [language, speakingIdx]);

  // ── Format message text ───────────────────────────────────────────────────
  const formatMessage = (text) =>
    text.split(/\*\*([^*]+)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="font-bold text-slate-900">{part}</strong> : part
    );

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Stop any ongoing speech/listening
    window.speechSynthesis.cancel();
    setSpeakingIdx(null);
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      const collected = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
      const res = await axios.post('/triage/chat', { message: userMessage, history, language, collected });

      if (res.data.collected) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...collected, ...res.data.collected }));
      }

      setMessages(prev => [...prev, { text: res.data.message, sender: 'ai' }]);
      setHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: res.data.message }
      ]);

      if (res.data.completed && res.data.specialization) {
        setCompleted(true);
        await findDoctors(res.data.specialization);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "I'm having trouble connecting. Please try again.";
      setMessages(prev => [...prev, { text: errorMsg, sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  const findDoctors = async (specialization) => {
    try {
      const res = await axios.post('/triage/find-doctors', { specialization });
      const doctors = res.data.doctors || [];
      setMessages(prev => [...prev, {
        text: doctors.length > 0
          ? (recommendText[language] || recommendText.english)(specialization)
          : `I recommend seeing a ${specialization}. No doctors are currently listed — please use the Book Appointment page to find one.`,
        sender: 'ai',
        doctors
      }]);
    } catch (error) {
      console.error('Error finding doctors:', error);
      setMessages(prev => [...prev, {
        text: `I recommend seeing a ${specialization}. Please use the Book Appointment page to find available doctors.`,
        sender: 'ai',
        doctors: []
      }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ height: '600px' }}>

        {/* Header */}
        <div className="bg-teal-600 p-4 flex justify-between items-center text-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Stethoscope size={24} />
            <h3 className="font-semibold">AI Doctor Triage</h3>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-teal-700 text-white text-sm px-3 py-1 rounded-full border border-teal-500 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="english">English</option>
              <option value="hindi">हिंदी</option>
              <option value="gujarati">ગુજરાતી</option>
            </select>
            <button onClick={onClose} className="hover:bg-teal-700 p-1 rounded-full">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx}>
              <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  {msg.sender === 'ai' ? formatMessage(msg.text) : msg.text}

                  {/* TTS button on every AI message */}
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => speakMessage(msg.text, idx)}
                      title={speakingIdx === idx ? 'Stop' : 'Listen'}
                      className="mt-2 flex items-center gap-1 text-xs text-teal-500 hover:text-teal-700 transition-colors"
                    >
                      {speakingIdx === idx
                        ? <><VolumeX size={13} /> Stop</>
                        : <><Volume2 size={13} /> Listen</>}
                    </button>
                  )}
                </div>
              </div>

              {/* Doctor cards */}
              {msg.doctors && msg.doctors.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-slate-600 font-semibold mb-2">Available Specialists:</p>
                  {msg.doctors.slice(0, 3).map((doc) => (
                    <button
                      key={doc._id}
                      onClick={() => window.location.href = `/patient/appointments?doctor=${doc._id}`}
                      className="w-full bg-white p-3 rounded-lg border border-teal-200 hover:border-teal-500 hover:shadow-md transition-all flex items-center gap-3 text-left"
                    >
                      <img
                        src={doc.profileImage || '/images/default-avtar.jpg'}
                        alt={doc.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-teal-100"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{doc.name}</p>
                        <p className="text-xs text-slate-600">{doc.doctorDetails?.specialization}</p>
                        <p className="text-xs text-teal-600 font-semibold">₹{doc.doctorDetails?.consultationFee}</p>
                      </div>
                      <div className="bg-teal-600 text-white px-4 py-2 rounded-full text-xs font-semibold">
                        Book Now
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200">
                <Loader2 className="animate-spin text-teal-600" size={16} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 flex gap-2 rounded-b-2xl items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={completed ? 'Consultation complete' : isListening ? 'Listening...' : 'Describe your symptoms...'}
            disabled={completed || loading}
            className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-teal-500 disabled:bg-slate-100"
          />

          {/* Mic button */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={completed || loading}
            title={isListening ? 'Stop listening' : 'Speak your symptoms'}
            className={`p-2 rounded-full transition-colors disabled:opacity-40 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-slate-100 text-slate-600 hover:bg-teal-100 hover:text-teal-600'
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Send button */}
          <button
            type="submit"
            disabled={loading || !input.trim() || completed}
            className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
};

export default AITriageChat;
