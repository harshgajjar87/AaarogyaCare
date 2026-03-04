import React from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from '../components/Chat';
import { ArrowLeft } from 'lucide-react';

const ChatPage = () => {
  const navigate = useNavigate();

  const handleBackToChats = () => {
    navigate('/chats');
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Chat</h1>
            <button 
              className="bg-slate-200 text-slate-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-slate-300 transition-all font-medium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center"
              onClick={handleBackToChats}
            >
                <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Back to Chats</span>
                <span className="sm:hidden">Back</span>
            </button>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border overflow-hidden" style={{ height: 'calc(100vh - 10rem)' }}>
            <Chat />
        </div>
    </div>
  );
};

export default ChatPage;
