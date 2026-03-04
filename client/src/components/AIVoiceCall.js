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
  const finalTranscriptRef = useRef('');
  const pushToTalkRef = useRef(false);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
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

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Changed to true for continuous listening
      recognitionRef.current.interimResults = true;

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
        console.log('Recognition ended, isSpeaking:', isSpeakingRef.current, 'pushToTalk:', pushToTalkRef.current);
        setIsRecording(false);
        // Auto-restart only if not in push-to-talk mode and not speaking
        if (!isSpeakingRef.current && !pushToTalkRef.current) {
          console.log('Auto-restarting recognition');
          setTimeout(() => {
            if (!isSpeakingRef.current && recognitionRef.current && !pushToTalkRef.current) {
              try {
                recognitionRef.current.start();
                setIsRecording(true);
                console.log('Auto-restart successful');
              } catch (e) {
                console.log('Auto-restart failed:', e.message);
                // Try one more time with longer delay
                setTimeout(() => {
                  if (!isSpeakingRef.current && recognitionRef.current && !pushToTalkRef.current) {
                    try {
                      recognitionRef.current.start();
                      setIsRecording(true);
                      console.log('Auto-restart retry successful');
                    } catch (retryError) {
                      console.error('Auto-restart retry failed:', retryError.message);
                    }
                  }
                }, 1000);
              }
            }
          }, 500);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        // Auto-restart on certain errors
        if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'aborted') {
          if (!isSpeakingRef.current) {
            setTimeout(() => {
              if (recognitionRef.current && !isSpeakingRef.current) {
                try {
                  recognitionRef.current.start();
                  setIsRecording(true);
                  console.log('Restarted after error:', event.error);
                } catch (e) {
                  console.error('Failed to restart after error:', e.message);
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
          console.log('Recognition stopped before speaking');
        } catch (e) {}
      }
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      
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
        
        // Adjust speech parameters for more natural Indian accent
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;
        
        console.log('Selected voice:', utterance.voice?.name || 'default');
        
        utterance.onstart = () => {
          console.log('Speech started');
        };
        
        utterance.onend = () => {
          console.log('Speech ended');
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          resolve();
        };
        
        utterance.onerror = (e) => {
          console.error('Speech error:', e);
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          resolve();
        };
        
        window.speechSynthesis.speak(utterance);
        console.log('Speech synthesis started');
      }, 200);
    });
  };

  const startCall = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsCallActive(true);
      const greetings = {
        english: "Hello, I'm your A.I. doctor. How can I help you today?",
        hindi: "नमस्ते, मैं आपका A.I. डॉक्टर हूं। मैं आपकी कैसे मदद कर सकता हूं?",
        gujarati: "નમસ્તે, હું તમારો A.I. ડોક્ટર છું. હું તમને કેવી રીતે મદદ કરી શકું?"
      };
      const greeting = greetings[language];
      setCallLog([{ text: greeting, sender: 'ai' }]);
      await speak(greeting);
      
      // Start continuous listening after greeting only if not in push-to-talk mode
      if (!isPushToTalk) {
        setTimeout(() => {
          if (recognitionRef.current) {
            const langMap = { english: 'en-IN', hindi: 'hi-IN', gujarati: 'gu-IN' };
            recognitionRef.current.lang = langMap[language] || 'en-IN';
            try {
              recognitionRef.current.start();
              setIsRecording(true);
              console.log('Continuous listening started');
            } catch (e) {
              console.log('Start failed:', e.message);
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
    
    pushToTalkRef.current = true;
    if (recognitionRef.current) {
      const langMap = { english: 'en-IN', hindi: 'hi-IN', gujarati: 'gu-IN' };
      recognitionRef.current.lang = langMap[language] || 'en-IN';
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        console.log('Push-to-talk recording started');
      } catch (e) {
        console.log('Push-to-talk start failed:', e.message);
      }
    }
  };

  const stopPushToTalkRecording = () => {
    pushToTalkRef.current = false;
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
        console.log('Push-to-talk recording stopped');
      } catch (e) {
        console.log('Push-to-talk stop failed:', e.message);
      }
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsSpeaking(false);
    onClose();
  };

  const handleVoiceInput = async (text) => {
    // Stop listening while processing
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsRecording(false);
      } catch (e) {}
    }
    
    setCallLog(prev => [...prev, { text, sender: 'user' }]);

    try {
      console.log('Sending to AI:', text);
      const res = await axios.post('/triage/chat', { 
        message: text, 
        history: history.map(h => ({ role: h.role, content: h.content })),
        language
      });

      console.log('AI Response:', res.data);
      setCallLog(prev => [...prev, { text: res.data.message, sender: 'ai' }]);
      setHistory(prev => [
        ...prev,
        { role: 'user', content: text },
        { role: 'model', content: res.data.message }
      ]);

      console.log('Starting to speak:', res.data.message);
      await speak(res.data.message);
      console.log('Finished speaking');
      
      // Resume listening after AI finishes speaking
      if (!res.data.completed) {
        setTimeout(() => {
          if (recognitionRef.current && !isPushToTalk) {
            try {
              console.log('Attempting to resume listening...');
              recognitionRef.current.start();
              setIsRecording(true);
              console.log('Resumed listening successfully');
            } catch (e) {
              console.error('Resume failed:', e.message);
              // Retry once more after a longer delay
              setTimeout(() => {
                if (recognitionRef.current && !isPushToTalk) {
                  try {
                    recognitionRef.current.start();
                    setIsRecording(true);
                    console.log('Resumed listening on retry');
                  } catch (retryError) {
                    console.error('Retry also failed:', retryError.message);
                  }
                }
              }, 1000);
            }
          }
        }, 500);
      } else {
        // Conversation completed
        setTimeout(async () => {
          const finalMsg = "You can now book an appointment from the dashboard.";
          setCallLog(prev => [...prev, { text: finalMsg, sender: 'ai' }]);
          await speak(finalMsg);
          setTimeout(endCall, 5000);
        }, 2000);
      }
    } catch (error) {
      console.error('Voice input error:', error);
      const errorMsg = "I'm having trouble connecting. Please try again.";
      setCallLog(prev => [...prev, { text: errorMsg, sender: 'ai' }]);
      await speak(errorMsg);
      
      // Resume listening after error message
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
            setIsRecording(true);
            console.log('Resumed listening after error');
          } catch (e) {
            console.error('Failed to resume after error:', e.message);
          }
        }
      }, 500);
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
