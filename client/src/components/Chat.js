
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  createOrAccessChat,
  getChatById,
  sendMessage,
  extendChatExpiration,
  endChat
} from '../api/chatAPI';
import '../styles/components/Chat.css';

const Chat = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load or create chat
  useEffect(() => {
    const loadChat = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to access the chat for this appointment
        const chatData = await getChatById(chatId);
        setChat(chatData);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(chat._id, message);
      setMessage('');

      // Refresh chat to get the updated messages
      const updatedChat = await getChatById(chat._id);
      setChat(updatedChat);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.msg || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Handle extending chat expiration
  const handleExtendChat = async () => {
    try {
      await extendChatExpiration(chat._id);

      // Refresh chat to get updated expiration
      const updatedChat = await getChatById(chat._id);
      setChat(updatedChat);

      // Show success message
      alert('Chat expiration extended by 5 days');
    } catch (err) {
      console.error('Error extending chat:', err);
      setError(err.response?.data?.msg || 'Failed to extend chat');
    }
  };

  // Handle ending chat (doctor only)
  const handleEndChat = async () => {
    if (!window.confirm('Are you sure you want to end this chat? This action cannot be undone.')) {
      return;
    }

    try {
      await endChat(chat._id);

      // Refresh chat to get updated status
      const updatedChat = await getChatById(chat._id);
      setChat(updatedChat);

      // Show success message
      alert('Chat ended successfully');
    } catch (err) {
      console.error('Error ending chat:', err);
      setError(err.response?.data?.msg || 'Failed to end chat');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate remaining days
  const getRemainingDays = () => {
    if (!chat) return 0;
    const now = new Date();
    const expirationDate = new Date(chat.expiresAt);
    const diffTime = expirationDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <div className="chat-container loading">Loading chat...</div>;
  }

  if (error) {
    return <div className="chat-container error">Error: {error}</div>;
  }

  if (!chat) {
    return <div className="chat-container">No chat found</div>;
  }

  // Get current user info from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserRole = userData.role || 'patient';
  const isDoctor = currentUserRole === 'doctor';

  const remainingDays = getRemainingDays();
  const isExpired = remainingDays <= 0;
  const isReadOnly = isExpired || chat.endedByDoctor || chat.readOnly || chat.status === 'archived';

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-participants">
          <div className="participant patient">
            <div className="avatar">
              <img src={chat.patientId?.profileImage ? `http://localhost:5000${chat.patientId.profileImage}` : '/images/default-avtar.jpg'} alt={chat.patientId?.name || 'Patient'} style={{ borderRadius: '50%', width: '50px', height: '50px', objectFit: 'cover' }}/>
            </div>
            <div className="info">
              <div className="name">{chat.patientId?.name || 'Patient'}</div>
              <div className="role">Patient</div>
            </div>
          </div>

          <div className="vs">To</div>

          <div className="participant doctor">
            <div className="avatar">
              <img src={chat.doctorId?.profileImage ? `http://localhost:5000${chat.doctorId.profileImage}` : '/images/default-avtar.jpg'} alt={chat.doctorId?.name || 'Doctor'} style={{ borderRadius: '50%', width: '50px', height: '50px', objectFit: 'cover'}} />
            </div>
            <div className="info">
              <div className="name">{chat.doctorId?.name || 'Doctor'}</div>
              <div className="role">Doctor</div>
            </div>
          </div>
        </div>

        <div className="chat-info">
          <div className="appointment-info">
            <div className="date">Date: {chat.appointmentId ? formatDate(chat.appointmentId.date) : 'N/A'}</div>
            <div className="time">Time: {chat.appointmentId ? chat.appointmentId.time : 'N/A'}</div>
          </div>

          <div className={`expiration ${isReadOnly ? 'expired' : 'active'}`}>
            {chat.endedByDoctor ? (
              <span>Ended by Doctor</span>
            ) : isExpired ? (
              <span>Chat Expired</span>
            ) : (
              <span>Expires in: {remainingDays} days</span>
            )}
                {!isReadOnly && (
                  <div className="chat-actions">
                    {isDoctor && (
                      <>
                        <button onClick={handleExtendChat} className="extend-btn">
                          Extend Chat
                        </button>
                        <button onClick={handleEndChat} className="end-btn">
                          End Chat
                        </button>
                      </>
                    )}
                  </div>
                )}
          </div>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages">
          {chat.messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.senderId?._id === chat.patientId?._id ? 'patient' : 'doctor'}`}
            >
              <div className="message-avatar">
                <img src={msg.senderId?.profileImage ? `http://localhost:5000${msg.senderId.profileImage}` : '/images/default-avtar.jpg'} alt={msg.senderId?.name || 'User'} />
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="sender-name">{msg.senderId?.name || 'Unknown'}</span>
                  <span className="message-time">{formatDate(msg.timestamp)}</span>
                </div>
                <div className="message-text">{msg.message}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {!isReadOnly && (
        <div className="message-form">
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending}
            />
            <button type="submit" disabled={isSending || !message.trim()}>
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      )}
      {isReadOnly && (
        <div className="read-only-notice">
          <div className="read-only-message">
            {chat.endedByDoctor ?
              "This chat has been ended by the doctor and is now read-only." :
              chat.status === 'archived' ?
              "This chat is archived and is now read-only." :
              "This chat has expired and is now read-only."
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
