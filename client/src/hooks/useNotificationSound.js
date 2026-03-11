import { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for playing notification sound
 * @returns {Function} playSound - Function to play the notification sound
 */
const useNotificationSound = () => {
  const audioRef = useRef(null);
  const isAudioUnlockedRef = useRef(false);

  // Initialize audio on first use
  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/notification-sound.mp3');
      audioRef.current.volume = 0.5; // Set volume to 50%
      audioRef.current.preload = 'auto'; // Preload the audio
    }
  }, []);

  // Unlock audio on user interaction (required by browsers)
  useEffect(() => {
    const unlockAudio = () => {
      if (!isAudioUnlockedRef.current) {
        initAudio();
        // Try to play and immediately pause to unlock audio context
        audioRef.current?.play().then(() => {
          audioRef.current?.pause();
          audioRef.current.currentTime = 0;
          isAudioUnlockedRef.current = true;
        }).catch(() => {
          // Silently fail - will try again on next interaction
        });
      }
    };

    // Listen for user interactions to unlock audio
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, [initAudio]);

  // Play notification sound
  const playSound = useCallback(() => {
    try {
      initAudio();
      
      // Reset audio to start if already playing
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // Handle autoplay restrictions in browsers
            if (error.name === 'NotAllowedError') {
              console.warn('Notification sound blocked by browser autoplay policy. User interaction required.');
            } else {
              console.warn('Notification sound error:', error);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [initAudio]);

  return playSound;
};

export default useNotificationSound;
