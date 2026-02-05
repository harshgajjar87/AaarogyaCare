import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getChatById, sendMessage, extendChatExpiration, endChat } from '../api/chatAPI';
import { Send, Clock, Power, AlertCircle, User, Stethoscope, Loader2, Check, CheckCheck, Smile, Paperclip, Mic, MicOff, Image, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EMOJIS = ['😊', '😂', '😍', '🤔', '😢', '😡', '👍', '👎', '❤️', '🙏', '💊', '🩺', '🏥', '📋', '📊', '⚕️', '🤒', '😷', '💉', '🔬'];

const Chat = () => {
  const { chatId } = useParams();
  const { user: authUser } = useAuth();
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const loadChat = async () => {
      try {
        setLoading(true);
        setError(null);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker')) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  useEffect(scrollToBottom, [chat?.messages]);

  const handleSendMessage = async (e, messageContent = null, fileData = null) => {
    e?.preventDefault();
    const content = messageContent || message;
    if ((!content.trim() && !fileData) || isSending) return;

    setIsSending(true);
    try {
      if (fileData) {
        // Handle file upload
        const formData = new FormData();
        formData.append('message', content || 'File shared');
        formData.append('file', fileData);
        // You would need to modify the sendMessage API to handle files
        await sendMessage(chat._id, content || 'File shared');
      } else {
        await sendMessage(chat._id, content);
      }
      setMessage('');
      const updatedChat = await getChatById(chat._id);
      setChat(updatedChat);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleSendMessage(null, `📎 ${file.name}`, file);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleSendMessage(null, `🖼️ ${file.name}`, file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], 'voice-message.wav', { type: 'audio/wav' });
        handleSendMessage(null, '🎤 Voice message', file);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      setError('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleExtendChat = async () => {
    try {
      const updatedChat = await extendChatExpiration(chat._id);
      setChat(updatedChat);
      alert('Chat expiration extended by 5 days');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to extend chat');
    }
  };

  const handleEndChat = async () => {
    if (window.confirm('Are you sure you want to end this chat? This action cannot be undone.')) {
      try {
        const updatedChat = await endChat(chat._id);
        setChat(updatedChat);
        alert('Chat ended successfully');
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to end chat');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getRemainingDays = () => {
    if (!chat?.expiresAt) return 0;
    const diff = new Date(chat.expiresAt) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  
  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-teal-500" size={48} /></div>;
  if (error) return <div className="flex items-center justify-center h-full text-red-500"><AlertCircle className="mr-2"/>{error}</div>;
  if (!chat) return <div className="flex items-center justify-center h-full text-slate-500"><AlertCircle className="mr-2"/>No chat found.</div>;
  
  const isDoctor = authUser?.role === 'doctor';
  const remainingDays = getRemainingDays();
  const isReadOnly = remainingDays <= 0 || chat.endedByDoctor || chat.status === 'archived';
  const messageGroups = (chat.messages || []).reduce((groups, msg) => {
    const date = new Date(msg.timestamp).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-white shadow-sm border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
            <img src={isDoctor ? chat.patientId?.profileImage : chat.doctorId?.profileImage} alt="Avatar" className="w-10 h-10 rounded-full object-cover mr-3"/>
            <div>
                <h3 className="font-semibold text-slate-800">{isDoctor ? chat.patientId?.name : chat.doctorId?.name}</h3>
                <p className="text-xs text-slate-500">{isDoctor ? 'Patient' : 'Doctor'}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${isReadOnly ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {chat.endedByDoctor ? 'Ended' : remainingDays <= 0 ? 'Expired' : `Expires in ${remainingDays} days`}
            </div>
            {isDoctor && !isReadOnly && (
                <div className="flex gap-2">
                    <button onClick={handleExtendChat} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"><Clock size={20}/></button>
                    <button onClick={handleEndChat} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><Power size={20}/></button>
                </div>
            )}
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.keys(messageGroups).map(date => (
            <div key={date}>
                <div className="text-center text-xs text-slate-500 my-2">{new Date(date).toLocaleDateString()}</div>
                {messageGroups[date].map(msg => {
                    const isMe = msg.senderId?._id === authUser?._id;
                    return (
                        <div key={msg._id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : ''}`}>
                            {!isMe && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                    {msg.senderId?.role === 'doctor' ? <Stethoscope size={16} /> : <User size={16} />}
                                </div>
                            )}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isMe ? 'bg-teal-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none shadow-sm'}`}>
                                <p className="text-sm">{msg.message}</p>
                                {msg.message.includes('📎') && (
                                  <div className="mt-2 p-2 bg-slate-100 rounded flex items-center gap-2">
                                    <FileText size={16} />
                                    <span className="text-xs">Document</span>
                                  </div>
                                )}
                                {msg.message.includes('🖼️') && (
                                  <div className="mt-2 p-2 bg-slate-100 rounded flex items-center gap-2">
                                    <Image size={16} />
                                    <span className="text-xs">Image</span>
                                  </div>
                                )}
                                {msg.message.includes('🎤') && (
                                  <div className="mt-2 p-2 bg-slate-100 rounded flex items-center gap-2">
                                    <Mic size={16} />
                                    <span className="text-xs">Voice message</span>
                                  </div>
                                )}
                                <div className="text-xs opacity-70 mt-1">{formatDate(msg.timestamp)}</div>
                            </div>
                            {isMe && (
                                <div className="text-slate-400">
                                    {msg.read ? <CheckCheck size={16} className="text-blue-500"/> : <Check size={16} />}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {!isReadOnly && (
        <footer className="bg-white border-t p-4">
          {showEmojiPicker && (
            <div className="mb-2 p-2 bg-slate-50 rounded-lg border emoji-picker">
              <div className="grid grid-cols-10 gap-1">
                {EMOJIS.map((emoji, index) => (
                  <button key={index} onClick={() => handleEmojiClick(emoji)} className="p-1 hover:bg-slate-200 rounded text-lg">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                <Smile size={20} />
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                <Paperclip size={20} />
              </button>
              <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                <Image size={20} />
              </button>
              <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`p-2 rounded-full ${isRecording ? 'bg-red-100 text-red-600' : 'text-slate-500 hover:bg-slate-100'}`}>
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." disabled={isSending} className="flex-1 rounded-full border-slate-300 focus:ring-2 focus:ring-teal-500 py-2 px-4" />
            <button type="submit" disabled={isSending || !message.trim()} className="bg-teal-600 text-white rounded-full p-3 hover:bg-teal-700 disabled:opacity-50">
              {isSending ? <Loader2 className="animate-spin" /> : <Send />}
            </button>
          </form>
          <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.txt" />
          <input ref={imageInputRef} type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
        </footer>
      )}
    </div>
  );
};

export default Chat;
