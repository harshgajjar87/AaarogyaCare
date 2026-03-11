import React from 'react';
import useNotificationSound from '../hooks/useNotificationSound';

/**
 * Test component for notification sound
 * You can temporarily add this to any dashboard to test the sound
 */
const NotificationSoundTest = () => {
  const playSound = useNotificationSound();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={playSound}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
      >
        🔔 Test Notification Sound
      </button>
    </div>
  );
};

export default NotificationSoundTest;
