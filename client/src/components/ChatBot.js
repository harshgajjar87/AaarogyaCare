import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from '../utils/axios';
import { MessageCircle, X, Send, Loader2, Bot, Ticket } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ChatBot = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your AarogyaCare assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [ticketLoading, setTicketLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/chatbot', { message: userMessage });
      const botResponse = res.data.reply;
      setMessages(prev => [...prev, { 
        text: botResponse, 
        sender: 'bot',
        showTicketOption: true // Show ticket option after bot response
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble connecting right now.", 
        sender: 'bot',
        showTicketOption: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!ticketForm.name || !ticketForm.email || !ticketForm.subject || !ticketForm.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setTicketLoading(true);
    try {
      const response = await axios.post('/contact', ticketForm);
      
      if (response.data.success) {
        toast.success('Ticket created successfully! We will get back to you soon.');
        setShowTicketForm(false);
        setTicketForm({ name: '', email: '', subject: '', message: '' });
        setMessages(prev => [...prev, { 
          text: "✅ Your support ticket has been created successfully! Our team will contact you via email soon.", 
          sender: 'bot' 
        }]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket. Please try again.');
    } finally {
      setTicketLoading(false);
    }
  };

  const openTicketForm = () => {
    // Pre-fill user data if logged in
    if (user) {
      setTicketForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
    setShowTicketForm(true);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-24 left-3 sm:left-4 md:left-6 z-40">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[calc(100vw-1.5rem)] sm:w-80 md:w-96 mb-4 border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 ease-in-out animate-fade-in-up" style={{ height: '70vh', maxHeight: '500px' }}>
          {/* Header */}
          <div className="bg-teal-600 p-3 sm:p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot size={20} className="sm:w-6 sm:h-6" />
              <h3 className="font-semibold text-sm sm:text-base">Health Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-teal-700 p-1 rounded-full transition-colors">
              <X size={18} className="sm:w-5 sm:h-5" />
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
                  <button 
                    onClick={() => setShowTicketForm(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <form onSubmit={handleTicketSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({...ticketForm, name: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm({...ticketForm, email: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      placeholder="Brief description"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Message</label>
                    <textarea
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
                      placeholder="Describe your issue..."
                      rows="4"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={ticketLoading}
                    className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {ticketLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Ticket size={16} />
                        Submit Ticket
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg, idx) => (
                  <div key={idx}>
                    <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        msg.sender === 'user' 
                          ? 'bg-teal-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                    
                    {/* Show ticket button after bot responses */}
                    {msg.sender === 'bot' && msg.showTicketOption && idx === messages.length - 1 && (
                      <div className="flex justify-start mt-2">
                        <button
                          onClick={openTicketForm}
                          className="text-xs bg-white border border-teal-600 text-teal-600 px-3 py-1.5 rounded-full hover:bg-teal-50 transition-colors flex items-center gap-1.5"
                        >
                          <Ticket size={14} />
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
              <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <button 
                  type="submit" 
                  disabled={loading || !input.trim()}
                  className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0' : 'scale-100'} transition-transform duration-200 bg-teal-600 hover:bg-teal-700 text-white p-3 sm:p-4 rounded-full shadow-lg flex items-center justify-center`}
      >
        <MessageCircle size={24} className="sm:w-7 sm:h-7" />
      </button>
    </div>
  );
};

export default ChatBot;