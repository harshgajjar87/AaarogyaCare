
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Chat from '../components/Chat';
import PaitentNavbar from '../components/PaitentNavbar';

const ChatPage = () => {
  const navigate = useNavigate();
  
  // Get user role from user object in localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = userData.role || 'patient'; // Default to patient if not found

  const handleBackToChats = () => {
    navigate('/chats');
  };

  return (
    <div className="chat-page">
      
      <div className="content">
        <div className="container mt-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Chat</h2>
            <button 
              className="btn btn-secondary"
              onClick={handleBackToChats}
            >
              Back to Chats
            </button>
          </div>
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
