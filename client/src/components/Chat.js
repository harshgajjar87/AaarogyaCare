import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getChatById, sendMessage, extendChatExpiration, endChat, markMessagesAsRead } from '../api/chatAPI';
import axios from '../utils/axios';
import { Send, Clock, Power, AlertCircle, User, Stethoscope, Loader2, Check, CheckCheck, Smile, Paperclip, Mic, MicOff, Image, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFullImageUrl } from '../utils/imageUtils';

const EMOJIS = ['😊', '😂', '😍', '🥰', '😘', '🤗', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '🥴', '😠', '😡', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🥳', '🥺', '🤠', '🤡', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿', '👹', '👺', '💀', '☠️', '👻', '👽', '👾', '🤖', '💩', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', '🔠', '🔡', '🔢', '🔣', '🔤', '🅿️', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '💊', '💉', '🩺', '🩹', '🩼', '🩻', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧴', '🧷', '🧹', '🧺', '🧻', '🪒', '🧽', '🧯', '🛒', '🚬', '⚰️', '🪦', '⚱️', '🗿', '🪧', '🏥', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉', '♨️', '🎠', '🎡', '🎢', '💈', '🎪', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🛻', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🦽', '🦼', '🛺', '🚲', '🛴', '🛹', '🛼', '🚏', '🛣️', '🛤️', '🛢️', '⛽', '🚨', '🚥', '🚦', '🛑', '🚧', '⚓', '⛵', '🛶', '🚤', '🛳️', '⛴️', '🛥️', '🚢', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚁', '🚟', '🚠', '🚡', '🛰️', '🚀', '🛸', '🛎️', '🧳', '⌛', '⏳', '⌚', '⏰', '⏱️', '⏲️', '🕰️', '🕛', '🕧', '🕐', '🕜', '🕑', '🕝', '🕒', '🕞', '🕓', '🕟', '🕔', '🕠', '🕕', '🕡', '🕖', '🕢', '🕗', '🕣', '🕘', '🕤', '🕙', '🕥', '🕚', '🕦', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌙', '🌚', '🌛', '🌜', '🌡️', '☀️', '🌝', '🌞', '🪐', '⭐', '🌟', '🌠', '🌌', '☁️', '⛅', '⛈️', '🌤️', '🌥️', '🌦️', '🌧️', '🌨️', '🌩️', '🌪️', '🌫️', '🌬️', '🌀', '🌈', '🌂', '☂️', '☔', '⛱️', '⚡', '❄️', '☃️', '⛄', '☄️', '🔥', '💧', '🌊', '⚕️', '🔬', '🔭', '📡', '💉', '🩸', '💊', '🩹', '🩺', '🩻', '🩼', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧴', '🧷', '🧹', '🧺', '🧻', '🪒', '🧽', '🧯', '🛒', '🚬', '⚰️', '🪦', '⚱️', '🗿', '🪧', '📋', '📊', '📈', '📉', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️'];

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
        
        // Mark messages as read when chat is opened
        await markMessagesAsRead(chatId);
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

  // Periodically refresh chat to get updated read receipts
  useEffect(() => {
    if (!chatId) return;
    
    const interval = setInterval(async () => {
      try {
        const updatedChat = await getChatById(chatId);
        setChat(updatedChat);
      } catch (err) {
        // Silently fail - don't show error for background refresh
        console.warn('Failed to refresh chat:', err);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [chatId]);

  const handleSendMessage = async (e, messageContent = null, fileData = null) => {
    e?.preventDefault();
    const content = messageContent || message;
    if ((!content.trim() && !fileData) || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(chat._id, content || 'File shared', fileData);
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
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result; // Keep the full data URL with mime type
          
          console.log('🎤 Voice recording completed');
          console.log('   - Audio size:', blob.size, 'bytes');
          console.log('   - Audio type:', blob.type);
          console.log('   - Base64 length:', base64Audio.length);
          console.log('   - Base64 preview:', base64Audio.substring(0, 100) + '...');
          
          // Send the voice message with base64 audio data
          setIsSending(true);
          try {
            const response = await axios.post(`/chat/${chat._id}/messages`, {
              message: '🎤 Voice message',
              audioData: base64Audio
            });
            
            console.log('✅ Voice message sent successfully');
            
            // Update chat with the response
            setChat(response.data);
          } catch (err) {
            console.error('❌ Failed to send voice message:', err);
            console.error('   - Error response:', err.response?.data);
            setError(err.response?.data?.msg || 'Failed to send voice message');
          } finally {
            setIsSending(false);
          }
        };
        reader.readAsDataURL(blob);
        
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
      <header className="bg-white shadow-sm border-b p-3 sm:p-4 flex items-center justify-between">
        <div className="flex items-center min-w-0">
            {(isDoctor ? chat.patientId?.profileImage : chat.doctorId?.profileImage) ? (
              <img 
                src={isDoctor ? chat.patientId?.profileImage : chat.doctorId?.profileImage} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full object-cover mr-2 sm:mr-3 flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/default-avtar.jpg';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                {isDoctor ? <User size={20} className="text-slate-600" /> : <Stethoscope size={20} className="text-slate-600" />}
              </div>
            )}
            <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-800 truncate text-sm sm:text-base">{isDoctor ? chat.patientId?.name : chat.doctorId?.name}</h3>
                <p className="text-xs text-slate-500">{isDoctor ? 'Patient' : 'Doctor'}</p>
            </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
            <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${isReadOnly ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {chat.endedByDoctor ? 'Ended' : remainingDays <= 0 ? 'Expired' : `Expires in ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`}
            </div>
            {isDoctor && !isReadOnly && (
                <div className="flex gap-1 sm:gap-2">
                    <button onClick={handleExtendChat} className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-full"><Clock size={18} className="sm:w-5 sm:h-5"/></button>
                    <button onClick={handleEndChat} className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-full"><Power size={18} className="sm:w-5 sm:h-5"/></button>
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
                                {msg.fileType === 'audio' && msg.audioData ? (
                                  <div className="mt-2">
                                    <audio controls className="w-full max-w-xs" style={{ height: '40px' }}>
                                      <source src={msg.audioData.startsWith('data:') ? msg.audioData : `data:audio/webm;base64,${msg.audioData}`} />
                                      Your browser does not support the audio element.
                                    </audio>
                                  </div>
                                ) : msg.fileType === 'audio' && msg.fileUrl ? (
                                  <div className="mt-2">
                                    <audio controls className="w-full max-w-xs" style={{ height: '40px' }}>
                                      <source src={getFullImageUrl(msg.fileUrl)} />
                                      Your browser does not support the audio element.
                                    </audio>
                                  </div>
                                ) : msg.message.includes('🎤') && !msg.fileUrl && !msg.audioData && (
                                  <div className="mt-2 p-2 bg-slate-100 rounded flex items-center gap-2">
                                    <Mic size={16} />
                                    <span className="text-xs italic opacity-70">Legacy voice message (no audio file)</span>
                                  </div>
                                )}
                                {msg.fileType === 'image' && msg.fileUrl && (
                                  <div className="mt-2">
                                    <img src={getFullImageUrl(msg.fileUrl)} alt="Shared" className="rounded max-w-xs" />
                                  </div>
                                )}
                                {msg.fileType === 'document' && msg.fileUrl && (
                                  <div className="mt-2 p-2 bg-slate-100 rounded flex items-center gap-2">
                                    <FileText size={16} />
                                    <a href={getFullImageUrl(msg.fileUrl)} target="_blank" rel="noopener noreferrer" className="text-xs underline">View Document</a>
                                  </div>
                                )}
                                <div className="text-xs opacity-70 mt-1">{formatDate(msg.timestamp)}</div>
                            </div>
                            {isMe && (
                                <div className="text-slate-400 flex-shrink-0">
                                    {msg.read ? (
                                      <CheckCheck size={16} className="text-blue-500" title={`Read ${msg.readAt ? new Date(msg.readAt).toLocaleString() : ''}`} />
                                    ) : (
                                      <CheckCheck size={16} className="text-slate-400" title="Delivered" />
                                    )}
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
        <footer className="bg-white border-t p-2 sm:p-4">
          {showEmojiPicker && (
            <div className="absolute bottom-16 sm:bottom-20 left-2 right-2 sm:left-4 sm:right-4 max-h-48 sm:max-h-64 overflow-y-auto p-2 sm:p-3 bg-white rounded-lg border-2 border-slate-200 shadow-lg emoji-picker z-50">
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
                {EMOJIS.map((emoji, index) => (
                  <button key={index} onClick={() => handleEmojiClick(emoji)} className="p-1 hover:bg-slate-200 rounded text-base sm:text-lg">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 sm:p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                <Smile size={18} className="sm:w-5 sm:h-5" />
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 sm:p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                <Paperclip size={18} className="sm:w-5 sm:h-5" />
              </button>
              <button type="button" onClick={() => imageInputRef.current?.click()} className="p-1.5 sm:p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                <Image size={18} className="sm:w-5 sm:h-5" />
              </button>
              <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`p-1.5 sm:p-2 rounded-full ${isRecording ? 'bg-red-100 text-red-600' : 'text-slate-500 hover:bg-slate-100'}`}>
                {isRecording ? <MicOff size={18} className="sm:w-5 sm:h-5" /> : <Mic size={18} className="sm:w-5 sm:h-5" />}
              </button>
            </div>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." disabled={isSending} className="flex-1 rounded-full border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent py-1.5 px-3 sm:py-2 sm:px-4 text-sm sm:text-base min-w-0" />
            <button type="submit" disabled={isSending || !message.trim()} className="bg-teal-600 text-white rounded-full p-2 sm:p-3 hover:bg-teal-700 disabled:opacity-50 flex-shrink-0">
              {isSending ? <Loader2 size={18} className="animate-spin sm:w-5 sm:h-5" /> : <Send size={18} className="sm:w-5 sm:h-5" />}
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
