import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatList from '../components/ChatList';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ChatListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleBackToDashboard = () => {
    if (user?.role === 'doctor') {
      navigate('/doctor/dashboard');
    } else {
      navigate('/patient/dashboard');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Your Chats</h1>
        <button 
          className="bg-slate-200 text-slate-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-slate-300 transition-all font-medium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
          onClick={handleBackToDashboard}
        >
          <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 md:p-6">
        <ChatList />
      </div>
    </div>
  );
};

export default ChatListPage;
