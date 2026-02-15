import React, { useState, useRef, useEffect } from 'react';
import axios from '../utils/axios';
import { Stethoscope, X, Send, Loader2, UserCheck } from 'lucide-react';

const AITriageChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI triage assistant. Please describe your symptoms, and I'll help find the right specialist for you.", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [language, setLanguage] = useState('english');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessage = (text) => {
    // Convert **text** to bold
    return text.split(/\*\*([^*]+)\*\*/g).map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="font-bold text-slate-900">{part}</strong> : part
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/triage/chat', { 
        message: userMessage, 
        history,
        language
      });

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
      console.error('Triage error:', error);
      const errorMsg = error.response?.data?.error || "I'm having trouble connecting. Please try again.";
      const hint = error.response?.data?.hint || '';
      setMessages(prev => [...prev, { 
        text: `${errorMsg}${hint ? ' (' + hint + ')' : ''}`, 
        sender: 'ai' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const findDoctors = async (specialization) => {
    try {
      const res = await axios.post('/triage/find-doctors', { specialization });
      setDoctors(res.data.doctors);
      setMessages(prev => [...prev, { 
        text: `I recommend seeing a ${specialization}. Here are available doctors:`, 
        sender: 'ai',
        doctors: res.data.doctors
      }]);
    } catch (error) {
      console.error('Error finding doctors:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ height: '600px' }}>
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
              disabled={messages.length > 1}
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
                </div>
              </div>
              
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

        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 flex gap-2 rounded-b-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={completed ? "Consultation complete" : "Describe your symptoms..."}
            disabled={completed || loading}
            className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-teal-500 disabled:bg-slate-100"
          />
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
