import React, { useState, useRef, useEffect } from 'react';
import axios from '../utils/axios';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const AIVoiceCall = ({ isOpen, onClose }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPushToTalk, setIsPushToTalk] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState([]);
  const [callLog, setCallLog] = useState([]);
  const [language, setLanguage] = useState('english');
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isCallActiveRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const pushToTalkRef = useRef(false);

  useEffect(() => {
    // Load available voices - critical for mobile
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log('Available voices:', voices.length);
      
      // Filter for Indian English voices
      const indianVoices = voices.filter(v => 
        v.lang.includes('en-IN') || 
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('rishi') ||
        v.name.toLowerCase().includes('neel')
      );
      
      // If no Indian voices, get all English voices
      const englishVoices = indianVoices.length > 0 ? indianVoices : voices.filter(v => v.lang.startsWith('en'));
      
      setAvailableVoices(englishVoices);
      if (englishVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(englishVoices[0]);
      }
    };

    // Mobile Safari requires voices to be loaded after user interaction
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Additional load attempt for mobile
    setTimeout(loadVoices, 100);

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Mobile works better with false
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        if (isSpeakingRef.current) return;
        
        let finalText = '';
        let interimText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript;
          } else {
            interimText += result[0].transcript;
          }
        }
        
        if (finalText) {
          console.log('Final transcript:', finalText);
          setTranscript('');
          handleVoiceInput(finalText.trim());
        } else if (interimText) {
          console.log('Interim transcript:', interimText);
          setTranscript(interimText);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Recognition ended, isSpeaking:', isSpeakingRef.current, 'pushToTalk:', pushToTalkRef.current, 'callActive:', isCallActiveRef.current);
        setIsRecording(false);
        
        // Mobile: Restart recognition manually after each result
        if (!isSpeakingRef.current && !pushToTalkRef.current && isCallActiveRef.current) {
          console.log('Preparing to restart recognition for mobile');
          setTimeout(() => {
            if (!isSpeakingRef.current && recognitionRef.current && !pushToTalkRef.current && isCallActiveRef.current) {
              try {
                recognitionRef.current.start();
                setIsRecording(true);
                console.log('✅ Recognition restarted for mobile');
              } catch (e) {
                console.log('❌ Restart failed:', e.message);
                if (e.name !== 'InvalidStateError') {
                  // Try again with longer delay
                  setTimeout(() => {
                    if (!isSpeakingRef.current && recognitionRef.current && !pushToTalkRef.current && isCallActiveRef.current) {
                      try {
                        recognitionRef.current.start();
                        setIsRecording(true);
                        console.log('✅ Recognition restarted on retry');
                      } catch (retryError) {
                        console.error('❌ Retry failed:', retryError.message);
                      }
                    }
                  }, 1500);
                }
              }
            }
          }, 800);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        setIsRecording(false);
        // Auto-restart on certain errors
        if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'aborted') {
          if (!isSpeakingRef.current && isCallActiveRef.current) {
            setTimeout(() => {
              if (recognitionRef.current && !isSpeakingRef.current && isCallActiveRef.current) {
                try {
                  recognitionRef.current.start();
                  setIsRecording(true);
                  console.log('✅ Restarted after error:', event.error);
                } catch (e) {
                  console.error('❌ Failed to restart after error:', e.message);
                }
              }
            }, 1000);
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const speak = (text) => {
    return new Promise((resolve) => {
      console.log('Speak function called with:', text);
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
          console.log('Recognition stopped before speaking');
        } catch (e) {}
      }
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setIsRecording(false);
      
      // Small delay to ensure recognition is fully stopped
      setTimeout(() => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
          };
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        const langMap = { english: 'en-IN', hindi: 'hi-IN', gujarati: 'gu-IN' };
        utterance.lang = langMap[language] || 'en-IN';
        
        // Use selected voice or find best match
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        } else {
          utterance.voice = voices.find(v => v.lang === utterance.lang) || 
                            voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0])) || null;
        }
        
        // Mobile-optimized speech parameters
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        console.log('Selected voice:', utterance.voice?.name || 'default');
        console.log('Speech settings:', { rate: utterance.rate, pitch: utterance.pitch, volume: utterance.volume, lang: utterance.lang });
        
        utterance.onstart = () => {
          console.log('✅ Speech started successfully');
        };
        
        utterance.onend = () => {
          console.log('✅ Speech ended successfully');
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          resolve();
        };
        
        utterance.onerror = (e) => {
          console.error('❌ Speech error:', e);
          console.error('Error details:', { error: e.error, message: e.message });
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          resolve();
        };
        
        // CRITICAL FIX: Resume speech synthesis context (fixes iOS/Safari and mobile Chrome)
        window.speechSynthesis.resume();
        
        window.speechSynthesis.speak(utterance);
        console.log('🔊 Speech synthesis started, speaking:', text.substring(0, 50) + '...');
        
        // Mobile fix: Keep speech synthesis alive
        const keepAlive = setInterval(() => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } else {
            clearInterval(keepAlive);
          }
        }, 5000);
        
        // Additional fix for browsers that pause immediately
        setTimeout(() => {
          window.speechSynthesis.resume();
        }, 100);
      }, 300);
    });
  };

  const startCall = async () => {
    try {
      // Request microphone permission with mobile-friendly constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      setIsCallActive(true);
      isCallActiveRef.current = true;
      
      const greetings = {
        english: "Hello! I'm here to help you. Could you tell me what's bothering you today?",
        hindi: "नमस्ते! मैं आपकी मदद के लिए यहां हूं। आज आपको क्या परेशानी है?",
        gujarati: "નમસ્તે! હું તમને મદદ કરવા માટે અહીં છું. આજે તમને શું તકલીફ છે?"
      };
      
      const greeting = greetings[language];
      setCallLog([{ text: greeting, sender: 'ai' }]);
      setHistory([{ role: 'model', content: greeting }]);
      
      await speak(greeting);
      
      // Start continuous listening after greeting only if not in push-to-talk mode
      if (!isPushToTalk) {
        setTimeout(() => {
          if (recognitionRef.current && isCallActiveRef.current) {
            const langMap = { english: 'en-IN', hindi: 'hi-IN', gujarati: 'gu-IN' };
            recognitionRef.current.lang = langMap[language] || 'en-IN';
            try {
              recognitionRef.current.start();
              setIsRecording(true);
              console.log('🎤 Continuous listening started');
            } catch (e) {
              console.log('❌ Start failed:', e.message);
            }
          }
        }, 500);
      }
    } catch (error) {
      alert('Microphone access is required for voice calls. Please allow microphone permission.');
    }
  };

  const startPushToTalkRecording = () => {
    if (!isCallActive || isSpeaking) return;
    
    console.log('Push-to-talk started');
    pushToTalkRef.current = true;
    
    if (recognitionRef.current) {
      const langMap = { english: 'en-IN', hindi: 'hi-IN', gujarati: 'gu-IN' };
      recognitionRef.current.lang = langMap[language] || 'en-IN';
      
      // Mobile: Small delay before starting
      setTimeout(() => {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
          console.log('✅ Push-to-talk recording started');
        } catch (e) {
          console.log('❌ Push-to-talk start failed:', e.message);
          // Retry once for mobile
          if (e.name !== 'InvalidStateError') {
            setTimeout(() => {
              try {
                recognitionRef.current.start();
                setIsRecording(true);
                console.log('✅ Push-to-talk started on retry');
              } catch (retryError) {
                console.error('❌ Push-to-talk retry failed:', retryError.message);
              }
            }, 300);
          }
        }
      }, 100);
    }
  };

  const stopPushToTalkRecording = () => {
    console.log('Push-to-talk stopped');
    pushToTalkRef.current = false;
    
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
        console.log('✅ Push-to-talk recording stopped');
      } catch (e) {
        console.log('❌ Push-to-talk stop failed:', e.message);
      }
    }
  };

  const endCall = () => {
    console.log('🔴 Ending call...');
    
    // Update ref first
    isCallActiveRef.current = false;
    
    // Stop speech synthesis
    window.speechSynthesis.cancel();
    
    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      } catch (e) {
        console.log('Recognition stop error:', e);
      }
    }
    
    // Reset all states
    setIsCallActive(false);
    setIsRecording(false);
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    pushToTalkRef.current = false;
    setTranscript('');
    setCallLog([]);
    setHistory([]);
    
    console.log('✅ Call ended, all states reset');
    onClose();
  };

  const handleVoiceInput = async (text) => {
    // Ignore empty or very short inputs
    if (!text || text.trim().length < 2) {
      console.log('Ignoring empty/short input');
      return;
    }
    
    // Stop listening while processing
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsRecording(false);
      } catch (e) {}
    }
    
    setCallLog(prev => [...prev, { text, sender: 'user' }]);

    try {
      console.log('📤 Sending to AI:', text);
      console.log('📜 History length:', history.length);
      
      const res = await axios.post('/triage/chat', { 
        message: text, 
        history: history,
        language
      });

      console.log('📥 AI Response:', res.data);
      
      const aiMessage = res.data.message;
      setCallLog(prev => [...prev, { text: aiMessage, sender: 'ai' }]);
      
      // Update history with proper format
      setHistory(prev => [
        ...prev,
        { role: 'user', content: text },
        { role: 'model', content: aiMessage }
      ]);

      console.log('🔊 Starting to speak:', aiMessage);
      await speak(aiMessage);
      console.log('✅ Finished speaking');
      
      // Check if specialist was recommended (conversation completed)
      if (res.data.completed || res.data.specialization) {
        console.log('✅ Triage completed, specialist:', res.data.specialization);
        setTimeout(async () => {
          const finalMsg = language === 'hindi' 
            ? "आप अब डैशबोर्ड से अपॉइंटमेंट बुक कर सकते हैं।"
            : language === 'gujarati'
            ? "તમે હવે ડેશબોર્ડમાંથી એપોઇન્ટમેન્ટ બુક કરી શકો છો."
            : "You can now book an appointment from the dashboard.";
          
          setCallLog(prev => [...prev, { text: finalMsg, sender: 'ai' }]);
          await speak(finalMsg);
          setTimeout(endCall, 3000);
        }, 1000);
      } else {
        // Resume listening after AI finishes speaking
        console.log('🔄 Preparing to resume listening...');
        setTimeout(() => {
          console.log('🔍 Checking conditions - callActive:', isCallActiveRef.current, 'pushToTalk:', pushToTalkRef.current, 'speaking:', isSpeakingRef.current);
          if (recognitionRef.current && !pushToTalkRef.current && isCallActiveRef.current && !isSpeakingRef.current) {
            try {
              console.log('🎤 Attempting to resume listening...');
              recognitionRef.current.start();
              setIsRecording(true);
              console.log('✅ Resumed listening successfully');
            } catch (e) {
              console.error('❌ Resume failed:', e.message);
              // Retry once more after a longer delay
              setTimeout(() => {
                if (recognitionRef.current && !pushToTalkRef.current && isCallActiveRef.current && !isSpeakingRef.current) {
                  try {
                    recognitionRef.current.start();
                    setIsRecording(true);
                    console.log('✅ Resumed listening on retry');
                  } catch (retryError) {
                    console.error('❌ Retry also failed:', retryError.message);
                  }
                }
              }, 1000);
            }
          } else {
            console.log('⏸️ Not resuming - conditions not met');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Voice input error:', error);
      const errorMsg = language === 'hindi'
        ? "मुझे कनेक्ट करने में परेशानी हो रही है। कृपया पुनः प्रयास करें।"
        : language === 'gujarati'
        ? "મને કનેક્ટ કરવામાં મુશ્કેલી આવી રહી છે. કૃપા કરીને ફરી પ્રયાસ કરો."
        : "I'm having trouble connecting. Please try again.";
      
      setCallLog(prev => [...prev, { text: errorMsg, sender: 'ai' }]);
      await speak(errorMsg);
      
      // Resume listening after error message
      setTimeout(() => {
        if (recognitionRef.current && isCallActiveRef.current) {
          try {
            recognitionRef.current.start();
            setIsRecording(true);
            console.log('✅ Resumed listening after error');
          } catch (e) {
            console.error('❌ Failed to resume after error:', e.message);
          }
        }
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl shadow-2xl w-full max-w-md p-8 text-white">
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            <Phone size={64} className={isCallActive ? 'animate-pulse' : ''} />
          </div>
          <h2 className="text-2xl font-bold mb-2">AI Voice Doctor</h2>
          <p className="text-teal-100 text-sm mb-4">
            {isCallActive ? (isSpeaking ? 'AI is speaking...' : isRecording ? 'Listening...' : isPushToTalk ? 'Press & hold mic to speak' : 'Ready') : 'Ready to start'}
          </p>
          {!isCallActive && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPushToTalk}
                    onChange={(e) => setIsPushToTalk(e.target.checked)}
                    className="w-4 h-4 rounded border-white border-opacity-30 bg-white bg-opacity-20 text-teal-600 focus:ring-2 focus:ring-white"
                  />
                  <span className="text-sm">Push-to-Talk Mode</span>
                </label>
              </div>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-white bg-opacity-20 text-white text-sm px-4 py-2 rounded-full border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="english" className="text-slate-800">English</option>
                <option value="hindi" className="text-slate-800">हिंदी</option>
                <option value="gujarati" className="text-slate-800">ગુજરાતી</option>
              </select>
              
              {availableVoices.length > 0 && (
                <select 
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = availableVoices.find(v => v.name === e.target.value);
                    setSelectedVoice(voice);
                  }}
                  className="w-full bg-white bg-opacity-20 text-white text-sm px-4 py-2 rounded-full border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="" className="text-slate-800">Select Voice Accent</option>
                  {availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name} className="text-slate-800">
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {isCallActive && (
          <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto">
            {callLog.map((log, idx) => (
              <p key={idx} className={`text-sm mb-2 ${log.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <span className="font-semibold">{log.sender === 'user' ? 'You' : 'AI'}:</span> {log.text}
              </p>
            ))}
            {transcript && (
              <p className="text-sm text-right text-teal-200 italic">
                {transcript}...
              </p>
            )}
          </div>
        )}

        <div className="flex justify-center gap-4 mb-6">
          {isCallActive && (
            <div className="text-center">
              {isPushToTalk ? (
                <button
                  onMouseDown={startPushToTalkRecording}
                  onMouseUp={stopPushToTalkRecording}
                  onMouseLeave={stopPushToTalkRecording}
                  onTouchStart={startPushToTalkRecording}
                  onTouchEnd={stopPushToTalkRecording}
                  disabled={isSpeaking}
                  className={`p-6 rounded-full transition-all shadow-lg ${
                    isRecording 
                      ? 'bg-red-500 animate-pulse scale-110' 
                      : isSpeaking 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600 active:scale-95'
                  }`}
                >
                  <Mic size={32} />
                </button>
              ) : (
                <div className={`p-6 rounded-full transition-all shadow-lg ${
                  isRecording 
                    ? 'bg-red-500 animate-pulse' 
                    : isSpeaking 
                    ? 'bg-gray-400' 
                    : 'bg-green-500'
                }`}>
                  <Mic size={32} />
                </div>
              )}
              <p className="text-sm mt-2">
                {isSpeaking ? 'AI Speaking...' : isRecording ? 'Listening...' : isPushToTalk ? 'Press & Hold' : 'Ready'}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {!isCallActive ? (
            <button
              onClick={startCall}
              className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-full flex items-center gap-2 font-semibold transition-all shadow-lg"
            >
              <Phone size={24} />
              Start Call
            </button>
          ) : (
            <button
              onClick={endCall}
              className="bg-red-500 hover:bg-red-600 px-8 py-4 rounded-full flex items-center gap-2 font-semibold transition-all shadow-lg"
            >
              <PhoneOff size={24} />
              End Call
            </button>
          )}
        </div>

        {!isCallActive && (
          <button
            onClick={onClose}
            className="w-full mt-4 text-teal-100 hover:text-white text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default AIVoiceCall;
