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
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-health-text-h">Your Chats</h1>
        <button 
          className="bg-slate-200 text-slate-800 px-4 py-2 rounded-full hover:bg-slate-300 transition-all font-medium flex items-center gap-2 text-sm"
          onClick={handleBackToDashboard}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <ChatList />
      </div>
    </div>
  );
};

export default ChatListPage;
