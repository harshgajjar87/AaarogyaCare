import axios from 'axios';

// Ensure we have a valid base URL (avoid "undefined/api" issues)
const isDev = process.env.NODE_ENV === 'development';
const baseURL = isDev
  ? 'http://localhost:5000/api'
  : 'https://aaarogyacare.onrender.com/api';

const instance = axios.create({
  baseURL,
});

// Attach auth token if present
instance.interceptors.request.use(config => {
  const userString = localStorage.getItem('user');
  let user = null;

  // Only try to parse if userString is not null and not the literal string "undefined"
  if (userString && userString !== 'undefined') {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      // If parsing fails, clear the bad data
      localStorage.removeItem('user');
    }
  }

  // Now, user is either the parsed object or null, and the code won't crash
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  
  return config;
});

// Global 401 handler: clear auth and redirect to login
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Clear any stale auth data
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
