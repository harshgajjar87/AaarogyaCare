import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserChats, createOrAccessChat, checkApprovedAppointments, createTestChatDebug } from '../api/chatAPI';
import '../styles/components/ChatList.css';

const ChatList = () => {
  const [activeChats, setActiveChats] = useState([]);
  const [archivedChats, setArchivedChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [testAppointmentId, setTestAppointmentId] = useState('');
  const [approvedAppointmentsInfo, setApprovedAppointmentsInfo] = useState(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Fetching chats...');
        
        // Check if user is authenticated
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token || localStorage.getItem('token');
        
        console.log('👤 Current user:', user);
        console.log('🎭 User role:', user?.role);
        
        // Store debug info for display
        setDebugInfo({
          userId: user?._id,
          userRole: user?.role,
          hasToken: !!token,
          timestamp: new Date().toISOString()
        });
        
        if (!token) {
          throw new Error('User not authenticated. Please log in again.');
        }
        
        // Check for approved appointments first
        const approvedAppointments = await checkApprovedAppointments();
        setApprovedAppointmentsInfo(approvedAppointments);
        
        // Get all chats (both active and archived)
        const chatData = await getUserChats();
        console.log('✅ Chats fetched successfully:', chatData);
        
        setActiveChats(chatData.activeChats || []);
        setArchivedChats(chatData.archivedChats || []);
        
        // Update debug info
        setDebugInfo(prev => ({
          ...prev,
          activeChatCount: chatData.activeChats?.length || 0,
          archivedChatCount: chatData.archivedChats?.length || 0,
          hasApprovedAppointments: approvedAppointments.hasApprovedAppointments,
          approvedAppointmentsCount: approvedAppointments.approvedAppointmentsCount,
          serverResponse: 'success'
        }));
        
      } catch (err) {
        console.error('❌ Error fetching chats:', err);
        const errorMessage = err.response?.data?.msg || err.message || 'Failed to fetch chats';
        
        // Handle specific error cases
        if (err.response?.data?.hasApprovedAppointments === false) {
          setError('You don\'t have any approved appointments yet. Please wait for your appointments to be approved.');
        } else if (err.response?.data?.allChatsExpired) {
          setError('All your chat sessions have expired. Please contact the doctor to extend the chat if needed.');
        } else {
          setError(errorMessage);
        }
        
        // Update debug info with error details
        setDebugInfo(prev => ({
          ...prev,
          error: errorMessage,
          errorStatus: err.response?.status,
          errorData: err.response?.data
        }));
        
        // Log detailed error information for debugging
        if (err.response) {
          console.error('📡 Error response:', err.response.data);
          console.error('📊 Error status:', err.response.status);
          console.error('📋 Error headers:', err.response.headers);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Function to manually create a test chat using debug endpoint
  const handleCreateTestChatDebug = async () => {
    if (!testAppointmentId.trim()) {
      alert('Please enter a valid appointment ID');
      return;
    }

    try {
      console.log('🛠️ Creating test chat for appointment:', testAppointmentId);
      const result = await createTestChatDebug(testAppointmentId);
      console.log('✅ Test chat created:', result);
      alert(`Test chat created successfully! Chat ID: ${result.chat._id}`);
      
      // Refresh the chat list
      const chatData = await getUserChats();
      setActiveChats(chatData.activeChats || []);
      setArchivedChats(chatData.archivedChats || []);
    } catch (err) {
      console.error('❌ Error creating test chat:', err);
      const errorMessage = err.response?.data?.msg || err.message || 'Failed to create test chat';
      alert(`Error: ${errorMessage}`);
    }
  };

  // Function to refresh chat list
  const handleRefreshChats = async () => {
    try {
      setLoading(true);
      const chatData = await getUserChats();
      setActiveChats(chatData.activeChats || []);
      setArchivedChats(chatData.archivedChats || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error refreshing chats:', err);
      const errorMessage = err.response?.data?.msg || err.message || 'Failed to refresh chats';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get chat status indicator
  const getChatStatusIndicator = (chat) => {
    const remainingDays = getRemainingDays(chat.expiresAt);
    const isExpired = remainingDays <= 0;
    const hasMessages = chat.messages.length > 0;

    if (chat.endedByDoctor) {
      return { status: 'ended', label: 'Ended by Doctor', className: 'status-ended' };
    } else if (isExpired) {
      return { status: 'expired', label: 'Expired', className: 'status-expired' };
    } else if (remainingDays <= 1) {
      return { status: 'expiring', label: 'Expiring soon', className: 'status-expiring' };
    } else if (!hasMessages) {
      return { status: 'new', label: 'New chat', className: 'status-new' };
    } else {
      return { status: 'active', label: 'Active', className: 'status-active' };
    }
  };

  // Calculate remaining days for chat expiration
  const getRemainingDays = (expiresAt) => {
    const now = new Date();
    const expirationDate = new Date(expiresAt);
    const diffTime = expirationDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Render chat item component
  const ChatItem = ({ chat }) => {
    const remainingDays = getRemainingDays(chat.expiresAt);
    const isExpired = remainingDays <= 0;
    const statusInfo = getChatStatusIndicator(chat);

    return (
      <Link 
        key={chat._id} 
        to={`/chats/${chat._id}`} 
        className={`chat-item ${statusInfo.className}`}
      >
        <div className="chat-participants">
          <div className="participant-info">
            <div className="avatar">
              <img
                src={chat.patientId?.profileImage ? `http://localhost:5000${chat.patientId.profileImage}` : '/images/default-avtar.jpg'}
                alt={chat.patientId?.name || 'Patient'}
                style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover'}}
              />
            </div>
            <div className="participant-details">
              <div className="name">{chat.patientId?.name || 'Patient'}</div>
              <div className="role">Patient</div>
            </div>
          </div>

          <div className="vs">VS</div>

          <div className="participant-info">
            <div className="avatar">
              <img
                src={chat.doctorId?.profileImage ? `http://localhost:5000${chat.doctorId.profileImage}` : '/images/default-avtar.jpg'}
                alt={chat.doctorId?.name || 'Doctor'}
                style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover'}}
              />
            </div>
            <div className="participant-details">
              <div className="name">{chat.doctorId?.name || 'Doctor'}</div>
              <div className="role">Doctor</div>
            </div>
          </div>
        </div>

        <div className="chat-meta">
          <div className="appointment-date">
            {chat.appointmentId ? formatDate(chat.appointmentId.date) : 'N/A'}
          </div>
          <div className={`expiration ${statusInfo.className}`}>
            <span>{statusInfo.label}</span>
          </div>
        </div>

        <div className="last-message">
          {chat.messages.length > 0 ? (
            <>
              <div className="message-preview">
                {chat.messages[chat.messages.length - 1].message}
              </div>
              <div className="message-sender">
                {chat.messages[chat.messages.length - 1].senderId?.name || 'Unknown'}
              </div>
            </>
          ) : (
            <div className="no-messages">No messages yet</div>
          )}
        </div>
      </Link>
    );
  };

  if (loading) {
    return <div className="chat-list-container loading">Loading chats...</div>;
  }

  if (error) {
    return <div className="chat-list-container error">Error: {error}</div>;
  }

  const totalChats = activeChats.length + archivedChats.length;
  
  if (totalChats === 0) {
    return (
      <div className="chat-list-container">
        <div className="no-chats">
          <div className="no-chats-header">
            <h3>No Chats Available</h3>
            <button 
              onClick={handleRefreshChats}
              className="refresh-button"
              title="Refresh chat list"
            >
              🔄 Refresh
            </button>
          </div>
          <p>You can start chatting with your doctor after your appointment is approved.</p>
          
          {/* Better user guidance */}
          <div className="user-guidance">
            <div className="guidance-card">
              <div className="guidance-icon">💬</div>
              <div className="guidance-content">
                <h4>How to start chatting</h4>
                <p>Chats are automatically created when your appointments are approved by the doctor.</p>
                <ul>
                  <li>✅ Book an appointment with a doctor</li>
                  <li>✅ Wait for the doctor to approve your appointment</li>
                  <li>✅ Chat will be available immediately after approval</li>
                </ul>
              </div>
            </div>
            
            {approvedAppointmentsInfo && (
              <div className={`appointments-status ${approvedAppointmentsInfo.hasApprovedAppointments ? 'has-appointments' : 'no-appointments'}`}>
                <h4>Your Approved Appointments Status</h4>
                {approvedAppointmentsInfo.hasApprovedAppointments ? (
                  <div className="status-positive">
                    <p>✅ You have {approvedAppointmentsInfo.approvedAppointmentsCount} approved appointment(s)</p>
                    <p>If you don't see chats, they may have expired or there might be a technical issue.</p>
                  </div>
                ) : (
                  <div className="status-negative">
                    <p>❌ You don't have any approved appointments yet</p>
                    <p>Please wait for your appointments to be approved by the doctors.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Debug information for developers */}
          {/* <div className="debug-section">
            <button 
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="debug-toggle"
            >
              {showDebugInfo ? '▼' : '▶'} Developer Debug Information
            </button>
            
            {showDebugInfo && (
              <div className="debug-info">
                <h4>Debug Information</h4>
                <div className="debug-grid">
                  <div><strong>User ID:</strong> {debugInfo.userId || 'N/A'}</div>
                  <div><strong>User Role:</strong> {debugInfo.userRole || 'N/A'}</div>
                  <div><strong>Has Token:</strong> {debugInfo.hasToken ? '✅ Yes' : '❌ No'}</div>
                  <div><strong>Active Chats:</strong> {debugInfo.activeChatCount !== undefined ? debugInfo.activeChatCount : 'N/A'}</div>
                  <div><strong>Archived Chats:</strong> {debugInfo.archivedChatCount !== undefined ? debugInfo.archivedChatCount : 'N/A'}</div>
                  <div><strong>Approved Apps:</strong> {debugInfo.hasApprovedAppointments ? `✅ ${debugInfo.approvedAppointmentsCount}` : '❌ None'}</div>
                  <div><strong>Server Response:</strong> {debugInfo.serverResponse || 'N/A'}</div>
                </div>
                {debugInfo.error && (
                  <div className="debug-error">
                    <strong>Error:</strong> {debugInfo.error}
                    {debugInfo.errorStatus && (
                      <span> (Status: {debugInfo.errorStatus})</span>
                    )}
                  </div>
                )}
              </div>
            )} 
          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h2>Your Chats</h2>
        <button 
          onClick={handleRefreshChats}
          className="refresh-button"
          title="Refresh chat list"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tab navigation */}
      <div className="chat-tabs">
        <button 
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Chats ({activeChats.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'archived' ? 'active' : ''}`}
          onClick={() => setActiveTab('archived')}
        >
          Archived Chats ({archivedChats.length})
        </button>
      </div>

      <div className="chats">
        {activeTab === 'active' && (
          <>
            {activeChats.length > 0 ? (
              activeChats.map((chat) => (
                <ChatItem chat={chat} key={chat._id} />
              ))
            ) : (
              <div className="no-chats-in-tab">
                <p>No active chats available.</p>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'archived' && (
          <>
            {archivedChats.length > 0 ? (
              archivedChats.map((chat) => (
                <ChatItem chat={chat} key={chat._id} />
              ))
            ) : (
              <div className="no-chats-in-tab">
                <p>No archived chats available.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatList;
