import { createContext, useContext, useState } from 'react';

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
    try {
      const saved = localStorage.getItem('user');
      if (!saved || saved === 'undefined' || saved === 'null') {
        localStorage.removeItem('user');
        return null;
      }
      
      const parsed = JSON.parse(saved);
      
      // Validate that parsed is an object with expected properties
      if (!parsed || typeof parsed !== 'object') {
        localStorage.removeItem('user');
        return null;
      }
      
      // ✅ One-time fix: migrate id → _id
      if (parsed.id && !parsed._id) {
        parsed._id = parsed.id;
        delete parsed.id;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
      
      return parsed;
    } catch (e) {
      // If parsing fails, remove the invalid data
      console.error('Error parsing user from localStorage:', e);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData); // ✅ FIX
    localStorage.setItem('user', JSON.stringify(userData)); // ✅ FIX
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
