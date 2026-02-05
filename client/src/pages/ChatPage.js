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
    <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-health-text-h">Chat</h1>
            <button 
              className="bg-slate-200 text-slate-800 px-4 py-2 rounded-full hover:bg-slate-300 transition-all font-medium flex items-center gap-2 text-sm"
              onClick={handleBackToChats}
            >
                <ArrowLeft size={16} />
                <span>Back to Chats</span>
            </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
            <Chat />
        </div>
    </div>
  );
};

export default ChatPage;
