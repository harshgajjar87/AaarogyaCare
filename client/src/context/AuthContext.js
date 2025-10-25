import { createContext, useContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    if (saved && saved !== 'undefined') {
      try {
        const parsed = JSON.parse(saved);
        // ✅ One-time fix: migrate id → _id
        if (parsed.id && !parsed._id) {
          parsed._id = parsed.id;
          delete parsed.id;
          localStorage.setItem('user', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        // If parsing fails, remove the invalid data
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  });

  const login = (userData) => {
    setUser(userData.user); // ✅ save only the user object, not the full response
    localStorage.setItem('user', JSON.stringify(userData.user));
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
