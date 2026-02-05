import { Mic, MicOff } from 'lucide-react';
import useVoiceInput from '../hooks/useVoiceInput';

const VoiceInput = ({ onTranscript, className = "" }) => {
  const { isListening, isSupported, startListening, stopListening } = useVoiceInput();

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        onTranscript(transcript);
      });
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleVoiceInput}
      className={`p-2 rounded-full transition-colors ${
        isListening 
          ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
      } ${className}`}
      title={isListening ? 'Stop recording' : 'Start voice input'}
    >
      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  );
};

export default VoiceInput;