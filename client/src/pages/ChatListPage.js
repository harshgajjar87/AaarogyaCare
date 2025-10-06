
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatList from '../components/ChatList';
import PaitentNavbar from '../components/PaitentNavbar';
import DoctorNavbar from '../components/DoctorNavbar';

const ChatListPage = () => {
  const navigate = useNavigate();
  
  // Get user role from user object in localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = userData.role || 'patient'; // Default to patient if not found

  const handleBackToDashboard = () => {
    if (userRole === 'doctor') {
      navigate('/doctor/dashboard');
    } else {
      navigate('/patient/dashboard');
    }
  };

  return (
    <div className="chat-list-page">
      {/* {userRole === 'doctor' ? <DoctorNavbar /> : <PaitentNavbar />} */}
      <div className="content">
        <div className="container mt-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Your Chats</h2>
            <button 
              className="btn btn-secondary"
              onClick={handleBackToDashboard}
            >
              Back to Dashboard
            </button>
          </div>
          <ChatList />
        </div>
      </div>
    </div>
  );
};

export default ChatListPage;
