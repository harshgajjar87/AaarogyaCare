import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AuthContext } from './AuthContext';
import { getNotifications, markAllAsSeen, clearNotifications as clearNotificationsAPI } from '../api/notificationAPI';
import useNotificationSound from '../hooks/useNotificationSound';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const playSound = useNotificationSound();
  const previousCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!user || !user._id) return; // ✅ Guard clause
    const data = await getNotifications(user._id);
    
    // Play sound if new notifications arrived (but not on initial load)
    const unseenCount = data.filter(n => !n.seen).length;
    
    if (unseenCount > previousCountRef.current && !isInitialLoadRef.current) {
      playSound();
    }
    previousCountRef.current = unseenCount;
    isInitialLoadRef.current = false; // Mark initial load as complete
    
    setNotifications(data);
    setHasNew(data.some(n => !n.seen));
  }, [user, playSound]);

  const markSeen = async () => {
    if (!user || !user._id) return; // ✅ Guard clause
    await markAllAsSeen(user._id);
    setHasNew(false);
    previousCountRef.current = 0; // Reset counter when marking as seen
    fetchNotifications(); // Refetch to update the list
  };

  const clearNotifications = async () => {
    if (!user || !user._id) return; // ✅ Guard clause
    await clearNotificationsAPI(user._id);
    setNotifications([]);
    setHasNew(false);
    previousCountRef.current = 0; // Reset counter when clearing
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, hasNew, fetchNotifications, markSeen, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

// ✅ Custom hook for cleaner access
export const useNotification = () => useContext(NotificationContext);
