import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from '../utils/axios';
import { MessageCircle, X, Send, Loader2, Bot, Ticket, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Quick questions with role-aware answers and navigation links
const QUICK_QUESTIONS = [
  {
    label: '📅 Book an Appointment',
    answer: 'You can book an appointment with any available doctor from the Book Appointment page. Choose your preferred specialist, pick a date and time slot, and confirm your booking.',
    link: { patient: '/patient/appointments', default: '/patient/appointments' },
    linkText: 'Book Appointment →',
  },
  {
    label: '📋 My Appointments',
    answer: 'View all your upcoming and past appointments on the My Appointments page. You can also cancel or reschedule from there.',
    link: { patient: '/patient/my-appointments', doctor: '/doctor/appointments', default: '/patient/my-appointments' },
    linkText: 'View Appointments →',
  },
  {
    label: '💊 My Prescriptions',
    answer: 'Your prescriptions are available on the Prescriptions page. You can view and download them as PDFs anytime.',
    link: { patient: '/patient/prescriptions', default: '/patient/prescriptions' },
    linkText: 'View Prescriptions →',
  },
  {
    label: '🧾 Payment History',
    answer: 'All your payment receipts and transaction history are on the Payment History page. You can download receipts as PDFs.',
    link: { patient: '/patient/payments', doctor: '/doctor/payments', default: '/patient/payments' },
    linkText: 'View Payments →',
  },
  {
    label: '📁 Medical Reports',
    answer: 'Your uploaded medical reports and doctor-shared reports are on the Medical Reports page. You can view and download them anytime.',
    link: { patient: '/patient/reports', doctor: '/doctor/reports', default: '/patient/reports' },
    linkText: 'View Reports →',
  },
  {
    label: '🤖 AI Health Tools',
    answer: 'AarogyaCare offers AI-powered tools: Symptom Checker to identify possible conditions, Health Risk Calculator for risk assessment, and Health Prediction for personalized insights.',
    links: [
      { label: 'Symptom Checker', path: '/symptom-checker' },
      { label: 'Health Risk', path: '/health-risk' },
      { label: 'Health Prediction', path: '/health-prediction' },
    ],
  },
];

const ChatBot = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [ticketLoading, setTicketLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const role = user?.role || 'default';

  const getLink = (q) => q.link?.[role] || q.link?.default || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Reset to welcome state when chat opens
  const handleOpen = () => {
    setIsOpen(true);
    setMessages([]);
    setShowTicketForm(false);
  };

  const handleQuickQuestion = (q) => {
    setMessages(prev => [
      ...prev,
      { text: q.label.replace(/^[^\s]+\s/, ''), sender: 'user' },
      { text: q.answer, sender: 'bot', quickLinks: q.links || (getLink(q) ? [{ label: q.linkText, path: getLink(q) }] : []), showTicketOption: true },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/chatbot', { message: userMessage });
      setMessages(prev => [...prev, { text: res.data.reply, sender: 'bot', showTicketOption: true }]);
    } catch {
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", sender: 'bot', showTicketOption: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketForm.name || !ticketForm.email || !ticketForm.subject || !ticketForm.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setTicketLoading(true);
    try {
      const response = await axios.post('/contact', ticketForm);
      if (response.data.success) {
        toast.success('Ticket created! We will get back to you soon.');
        setShowTicketForm(false);
        setTicketForm({ name: '', email: '', subject: '', message: '' });
        setMessages(prev => [...prev, { text: '✅ Support ticket created! Our team will contact you via email soon.', sender: 'bot' }]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket. Please try again.');
    } finally {
      setTicketLoading(false);
    }
  };

  const openTicketForm = () => {
    if (user) setTicketForm(prev => ({ ...prev, name: user.name || '', email: user.email || '' }));
    setShowTicketForm(true);
  };

  const showWelcome = messages.length === 0 && !showTicketForm;

  return (
    <div className="fixed bottom-20 sm:bottom-24 left-3 sm:left-4 md:left-6 z-40">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[calc(100vw-1.5rem)] sm:w-80 md:w-96 mb-4 border border-slate-200 overflow-hidden flex flex-col animate-fade-in-up" style={{ height: '70vh', maxHeight: '520px' }}>

          {/* Header */}
          <div className="bg-teal-600 p-3 sm:p-4 flex justify-between items-center text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-semibold text-sm sm:text-base">Health Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-teal-700 p-1 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Ticket Form */}
          {showTicketForm ? (
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Ticket size={20} className="text-teal-600" />
                    Create Support Ticket
                  </h4>
                  <button onClick={() => setShowTicketForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                </div>
                <form onSubmit={handleTicketSubmit} className="space-y-3">
                  {['name', 'email', 'subject'].map(field => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-slate-700 mb-1 capitalize">{field}</label>
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        value={ticketForm[field]}
                        onChange={(e) => setTicketForm({ ...ticketForm, [field]: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                        placeholder={field === 'email' ? 'your@email.com' : field === 'subject' ? 'Brief description' : 'Your name'}
                        required
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Message</label>
                    <textarea
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 resize-none"
                      placeholder="Describe your issue..."
                      rows="4"
                      required
                    />
                  </div>
                  <button type="submit" disabled={ticketLoading} className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {ticketLoading ? <><Loader2 className="animate-spin" size={16} />Submitting...</> : <><Ticket size={16} />Submit Ticket</>}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">

                {/* Welcome + quick questions */}
                {showWelcome && (
                  <div className="space-y-3">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm text-sm text-slate-700">
                      Hi! I'm your AarogyaCare assistant. What can I help you with today?
                    </div>
                    <p className="text-xs text-slate-400 font-medium px-1">Quick questions:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {QUICK_QUESTIONS.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickQuestion(q)}
                          className="text-left text-sm bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-700 px-3 py-2 rounded-xl transition-all flex items-center justify-between group"
                        >
                          <span>{q.label}</span>
                          <ArrowRight size={14} className="text-slate-300 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conversation messages */}
                {messages.map((msg, idx) => (
                  <div key={idx}>
                    <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        msg.sender === 'user'
                          ? 'bg-teal-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>

                    {/* Navigation links attached to bot message */}
                    {msg.sender === 'bot' && msg.quickLinks?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 ml-1">
                        {msg.quickLinks.map((link, li) => (
                          <button
                            key={li}
                            onClick={() => { setIsOpen(false); navigate(link.path); }}
                            className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-full hover:bg-teal-700 transition-colors"
                          >
                            {link.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Ticket option on last bot message */}
                    {msg.sender === 'bot' && msg.showTicketOption && idx === messages.length - 1 && (
                      <div className="flex justify-start mt-2">
                        <button
                          onClick={openTicketForm}
                          className="text-xs bg-white border border-teal-600 text-teal-600 px-3 py-1.5 rounded-full hover:bg-teal-50 transition-colors flex items-center gap-1.5"
                        >
                          <Ticket size={13} />
                          Need more help? Create a ticket
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                      <Loader2 className="animate-spin text-teal-600" size={16} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 flex gap-2 flex-shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Or type your question..."
                  className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-teal-500"
                />
                <button type="submit" disabled={loading || !input.trim()} className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        className={`${isOpen ? 'scale-0' : 'scale-100'} transition-transform duration-200 bg-teal-600 hover:bg-teal-700 text-white p-3 sm:p-4 rounded-full shadow-lg flex items-center justify-center`}
      >
        <MessageCircle size={24} className="sm:w-7 sm:h-7" />
      </button>
    </div>
  );
};

export default ChatBot;
