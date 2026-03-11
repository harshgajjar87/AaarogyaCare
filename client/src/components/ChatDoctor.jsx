import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatDoctor = () => {
  const [history, setHistory] = useState([
    { role: 'assistant', content: "Hello! I am Dr. Aarogya. How are you feeling today?" }
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = { role: 'user', content: message };
    const newHistory = [...history, userMessage];
    
    setHistory(newHistory);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_FLASK_API_URL || 'http://127.0.0.1:5001'}/chat`, {
        message: userMessage.content,
        history: history, // Send the history *before* the new user message
        language: 'English'
      });

      const assistantMessage = { role: 'assistant', content: response.data.reply };
      setHistory(prevHistory => [...prevHistory, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = { role: 'assistant', content: "I'm sorry, I'm having trouble connecting. Please try again later." };
      setHistory(prevHistory => [...prevHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 text-center">
        <h1 className="text-2xl font-bold text-blue-600">Text Consultation with Dr. Aarogya</h1>
      </header>
      
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg px-4 py-2 rounded-lg shadow ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-lg px-4 py-2 rounded-lg shadow bg-white text-gray-800">
              <span className="italic">Dr. Aarogya is typing...</span>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white p-2 sm:p-4 shadow-inner">
        <form onSubmit={handleSendMessage} className="flex items-center gap-1 sm:gap-0">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your symptoms..."
            className="flex-1 p-2 sm:p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-w-0"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-3 py-2 sm:px-4 sm:py-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300 text-sm sm:text-base whitespace-nowrap flex-shrink-0"
            disabled={isLoading || !message.trim()}
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatDoctor;