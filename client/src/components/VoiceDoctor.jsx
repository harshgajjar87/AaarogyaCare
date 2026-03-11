import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const VoiceDoctor = () => {
  // State management
  const [language, setLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voices, setVoices] = useState([]);

  // Refs for browser APIs and values that shouldn't trigger re-renders
  const lastSpokenText = useRef(null);
  const recognitionRef = useRef(null);

  // Configuration for languages
  const langConfig = {
    English: { code: 'en-US', voiceName: 'Google US English' },
    Hindi: { code: 'hi-IN', voiceName: 'Google हिन्दी' },
    Gujarati: { code: 'gu-IN', voiceName: 'Google ગુજરાતી' },
  };

  // Memoized function to speak text, depends on the selected language and available voices
  const speak = useCallback((text, langCode) => {
    if (!window.speechSynthesis || !text) return;
    
    // Prevent re-speaking the same message
    if (lastSpokenText.current === text) return;
    lastSpokenText.current = text;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    
    const selectedVoice = voices.find(voice => voice.name === langConfig[language]?.voiceName && voice.lang === langCode);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    } else {
        // Fallback to any voice for the language
        const fallbackVoice = voices.find(voice => voice.lang === langCode);
        if (fallbackVoice) utterance.voice = fallbackVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.cancel(); // Cancel any previous speech
    window.speechSynthesis.speak(utterance);
  }, [language, voices, langConfig]); // Re-create this function if language or voices change

  // Effect to load speech synthesis voices
  useEffect(() => {
    const onVoicesChanged = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    onVoicesChanged(); // Initial load
    return () => window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
  }, []);

  // Effect to initialize the component and speak a greeting when the language changes
  useEffect(() => {
    const greetings = {
        English: "Hello! I am Dr. Aarogya. Please press the microphone button and tell me how you are feeling today.",
        Hindi: "नमस्ते! मैं डॉ. आरोग्य हूँ। कृपया माइक्रोफ़ोन बटन दबाएँ और मुझे बताएँ कि आज आप कैसा महसूस कर रहे हैं।",
        Gujarati: "નમસ્તે! હું ડૉ. આરોગ્ય છું। કૃપા કરીને માઇક્રોફોન બટન દબાવો અને મને જણાવો કે આજે તમને કેવું લાગે છે."
    };
    const initialMessage = { role: 'assistant', content: greetings[language] };
    setHistory([initialMessage]);

    // Speak the greeting only after voices are loaded and the message is set
    if (voices.length > 0) {
      speak(initialMessage.content, langConfig[language].code);
    }
  }, [language, voices, speak, langConfig]); // Reruns on language change or when voices become available

  // Memoized handler for processing user speech and interacting with the backend
  const handleUserSpeech = useCallback((transcript) => {
    if (!transcript.trim()) return;

    const userMessage = { role: 'user', content: transcript };

    // Use functional update to get access to the most recent history
    setHistory(prevHistory => {
      const makeApiCall = async () => {
        setIsProcessing(true);
        try {
          // `prevHistory` is the correct, up-to-date history before the user's new message
          const response = await axios.post(`${process.env.REACT_APP_FLASK_API_URL || 'http://127.0.0.1:5001'}/chat`, {
            message: transcript,
            history: prevHistory,
            language: language,
          });

          const assistantMessage = { role: 'assistant', content: response.data.reply };
          // Update history again with the assistant's response
          setHistory(currentHistory => [...currentHistory, assistantMessage]);
          speak(assistantMessage.content, langConfig[language].code);
        } catch (error) {
          console.error("Error processing speech:", error);
          const errorMessage = { role: 'assistant', content: "I'm sorry, I'm having trouble connecting." };
          setHistory(currentHistory => [...currentHistory, errorMessage]);
          speak(errorMessage.content, langConfig[language].code);
        } finally {
          setIsProcessing(false);
        }
      };

      makeApiCall();

      // Return the new state with the user's message for an optimistic UI update
      return [...prevHistory, userMessage];
    });
  }, [language, speak, langConfig]);

  // Effect to set up and manage the SpeechRecognition API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    // Initialize recognition instance
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = langConfig[language].code;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleUserSpeech(transcript);
    };

    // Cleanup on component unmount or when dependencies change
    return () => {
      recognition.abort();
    };
  }, [language, handleUserSpeech, langConfig]); // Re-configure only when language or the handler function changes

  const toggleListen = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      // Stop any ongoing speech before listening
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      recognition.start();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="p-4 text-center border-b border-gray-700">
        <h1 className="text-2xl font-bold text-green-400">Voice Consultation with Dr. Aarogya</h1>
        <div className="mt-2">
          <label htmlFor="language-select" className="mr-2">Language:</label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-md p-1"
            disabled={isListening || isProcessing}
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Gujarati">Gujarati</option>
          </select>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="text-lg mb-8 max-w-2xl h-24 flex items-center justify-center">
          {history.length > 0 ? history[history.length - 1].content : "Press the button to start."}
        </div>
        
        <div className="relative">
          <button
            onClick={toggleListen}
            disabled={isProcessing}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-300
              ${isListening ? 'bg-red-500' : 'bg-green-500'}
              ${isProcessing ? 'bg-gray-500 cursor-not-allowed' : 'hover:bg-green-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          {isListening && (
            <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping"></div>
          )}
        </div>

        <div className="mt-8 text-gray-400 h-10">
            {isListening && "Listening..."}
            {isSpeaking && "Dr. Aarogya is speaking..."}
            {isProcessing && "Thinking..."}
            {!isListening && !isSpeaking && !isProcessing && "Press the mic to speak"}
        </div>
      </main>
    </div>
  );
};

export default VoiceDoctor;