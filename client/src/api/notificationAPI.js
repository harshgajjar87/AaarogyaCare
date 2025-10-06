import axios from '../utils/axios';

export const getNotifications = async (userId) => {
  try {
    const res = await axios.get(`/notifications/${userId}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return [];
  }
};

export const markAllAsSeen = async (userId) => {
  try {
    await axios.post(`/notifications/mark-seen/${userId}`);
  } catch (err) {
    console.error('Error marking notifications as seen:', err);
  }
};

export const clearNotifications = async (userId) => {
  try {
    await axios.delete(`/notifications/clear/${userId}`);
  } catch (err) {
    console.error('Error clearing notifications:', err);
  }
};
