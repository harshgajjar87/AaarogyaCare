import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { getNotifications, markAllAsSeen, clearNotifications as clearNotificationsAPI } from '../api/notificationAPI';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(false);

  const fetchNotifications = async () => {
    if (!user || !user._id) return; // ✅ Guard clause
    const data = await getNotifications(user._id);
    setNotifications(data);
    setHasNew(data.some(n => !n.seen));
  };

  const markSeen = async () => {
    if (!user || !user._id) return; // ✅ Guard clause
    await markAllAsSeen(user._id);
    setHasNew(false);
    fetchNotifications(); // Refetch to update the list
  };

  const clearNotifications = async () => {
    if (!user || !user._id) return; // ✅ Guard clause
    await clearNotificationsAPI(user._id);
    setNotifications([]);
    setHasNew(false);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications, hasNew, fetchNotifications, markSeen, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

// ✅ Custom hook for cleaner access
export const useNotification = () => useContext(NotificationContext);
