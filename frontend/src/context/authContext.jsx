import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check for existing token and verify it
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Verify token validity with backend
  // Example auth context implementation
  const verifyToken = async () => {
    try {
      const response = await axios.get('/api/verify-token', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      setUser(response.data.user);
      setLoading(false);
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      setUser(null);
      setLoading(false);
    }
  };

  // Login method: save token and user info
  const login = (userData, token) => {
    localStorage.setItem('accessToken', token);
    setUser(userData);
  };

  // Logout method: clear token and user info
  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume auth context easily
const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
