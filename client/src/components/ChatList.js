import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserChats } from '../api/chatAPI';
import { RefreshCw, AlertCircle, User, Stethoscope } from 'lucide-react';

const ChatList = () => {
  const [activeChats, setActiveChats] = useState([]);
  const [archivedChats, setArchivedChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const chatData = await getUserChats();
      setActiveChats(chatData.activeChats || []);
      setArchivedChats(chatData.archivedChats || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch chats.');
    } finally {
      setLoading(false);
    }
  };

  const getRemainingDays = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;

  const ChatItem = ({ chat }) => {
    const remainingDays = getRemainingDays(chat.expiresAt);

    // Show the OTHER person's name — not the logged-in user
    const isPatient = chat.patientId?._id?.toString() === currentUserId ||
                      chat.patientId?.toString() === currentUserId;
    const otherUser = isPatient
      ? (chat.doctorId?.name || 'Doctor')
      : (chat.patientId?.name || 'Patient');
    const otherUserRole = isPatient ? 'Doctor' : 'Patient';

    const lastMessage = chat.messages?.[chat.messages.length - 1];

    return (
      <Link to={`/chats/${chat._id}`} className="block p-4 rounded-xl border bg-white hover:bg-slate-50 transition-colors">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              {otherUserRole === 'Patient' ? <User className="text-slate-500"/> : <Stethoscope className="text-slate-500" />}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{otherUser}</p>
              <p className="text-sm text-slate-500 truncate max-w-xs">{lastMessage ? lastMessage.message : 'No messages yet'}</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>{lastMessage ? new Date(lastMessage.timestamp).toLocaleDateString() : ''}</p>
            {remainingDays > 0 && <p className="text-green-600">{remainingDays} days left</p>}
          </div>
        </div>
      </Link>
    );
  };
  
  if (loading) return <div className="text-center p-8">Loading chats...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  const chatsToShow = activeTab === 'active' ? activeChats : archivedChats;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex border border-slate-200 rounded-full p-1">
          <button onClick={() => setActiveTab('active')} className={`px-4 py-1 rounded-full text-sm font-medium ${activeTab === 'active' ? 'bg-teal-600 text-white' : 'text-slate-600'}`}>
            Active ({activeChats.length})
          </button>
          <button onClick={() => setActiveTab('archived')} className={`px-4 py-1 rounded-full text-sm font-medium ${activeTab === 'archived' ? 'bg-teal-600 text-white' : 'text-slate-600'}`}>
            Archived ({archivedChats.length})
          </button>
        </div>
        <button onClick={fetchChats} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><RefreshCw size={16} /></button>
      </div>

      <div className="space-y-4">
        {chatsToShow.length > 0 ? (
          chatsToShow.map(chat => <ChatItem key={chat._id} chat={chat} />)
        ) : (
          <div className="text-center py-16 text-slate-500">
            <AlertCircle size={48} className="mx-auto mb-4" />
            <h5 className="font-semibold text-lg">No {activeTab} chats</h5>
            <p>Your {activeTab} conversations will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
