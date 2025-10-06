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
    if (saved) {
      const parsed = JSON.parse(saved);
      // ✅ One-time fix: migrate id → _id
      if (parsed.id && !parsed._id) {
        parsed._id = parsed.id;
        delete parsed.id;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
      return parsed;
    }
    return null;
  });

  const login = (userData) => {
    setUser(userData); // ✅ save full data (token + user)
    localStorage.setItem('user', JSON.stringify(userData));
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
