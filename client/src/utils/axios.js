import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL + '/api' || 'http://localhost:5000/api',
});

instance.interceptors.request.use(config => {
  const userString = localStorage.getItem('user');
  let user = null;

  // Only try to parse if userString is not null and not the literal string "undefined"
  if (userString && userString !== 'undefined') {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
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

export default instance;
